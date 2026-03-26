import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

const DEFAULT_DATA = { weights: [], workouts: [], water: {}, calories: [] };

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getStoreKey(email) {
  if (!email) return 'fitmind_progress_guest';
  // Use a simple identifier derived from email
  try {
    return `fitmind_progress_u_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  } catch {
    return 'fitmind_progress_guest';
  }
}

function loadProgress(email) {
  try {
    const key = getStoreKey(email);
    const parsed = JSON.parse(localStorage.getItem(key));
    if (!parsed) return { ...DEFAULT_DATA };
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function persist(newData, email) {
  const key = getStoreKey(email);
  localStorage.setItem(key, JSON.stringify(newData));
  return newData;
}

export function useProgress() {
  const { userEmail } = useAuth();
  const [data, setData] = useState(() => loadProgress(userEmail));

  // Sync state if user switches accounts
  useEffect(() => {
    setData(loadProgress(userEmail));
  }, [userEmail]);

  const logWeight = useCallback((val, date) => {
    setData(prev => persist({ ...prev, weights: [{ val, date }, ...prev.weights].slice(0, 30) }, userEmail));
  }, [userEmail]);

  const deleteWeight = useCallback((index) => {
    setData(prev => {
      const newWeights = [...prev.weights];
      newWeights.splice(index, 1);
      return persist({ ...prev, weights: newWeights }, userEmail);
    });
  }, [userEmail]);

  const logWorkout = useCallback((type, mins) => {
    const dateStr = getToday();
    setData(prev => persist({
      ...prev,
      workouts: [{ type, mins, date: dateStr }, ...prev.workouts].slice(0, 50),
    }, userEmail));
  }, [userEmail]);

  const deleteWorkout = useCallback((index) => {
    setData(prev => {
      const newWorkouts = [...prev.workouts];
      newWorkouts.splice(index, 1);
      return persist({ ...prev, workouts: newWorkouts }, userEmail);
    });
  }, [userEmail]);

  const logCalories = useCallback((item, cal, explanation) => {
    const dateStr = getToday();
    setData(prev => persist({
      ...prev,
      calories: [{ item, cal, explanation, date: dateStr }, ...(prev.calories || [])].slice(0, 50),
    }, userEmail));
  }, [userEmail]);

  const deleteCalories = useCallback((index) => {
    setData(prev => {
      const newCal = [...(prev.calories || [])];
      newCal.splice(index, 1);
      return persist({ ...prev, calories: newCal }, userEmail);
    });
  }, [userEmail]);

  const setWater = useCallback((count) => {
    const key = getToday();
    setData(prev => persist({ ...prev, water: { ...prev.water, [key]: count } }, userEmail));
  }, [userEmail]);

  const getWaterToday = useCallback(() => {
    return data.water[getToday()] || 0;
  }, [data.water]);

  const getCaloriesToday = useCallback(() => {
    const ts = (data.calories || []).filter(c => c.date === getToday());
    return ts.reduce((sum, current) => sum + current.cal, 0);
  }, [data.calories]);

  const getThisWeekWorkouts = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return data.workouts.filter(w => new Date(w.date) >= weekAgo).length;
  }, [data.workouts]);

  const getStreak = useCallback(() => {
    let streak = 0;
    const dates = new Set(data.workouts.map(w => w.date));
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (dates.has(dateStr)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [data.workouts]);

  const getAvgWater = useCallback(() => {
    let total = 0, days = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (data.water[key]) { total += data.water[key]; days++; }
    }
    return days ? ((total / days) * 0.25).toFixed(1) : '0.0';
  }, [data.water]);

  const getActivitySummary = useCallback(() => {
    const typeMap = {
        cardio: ['run', 'jog', 'bike', 'cycle', 'swim', 'hike', 'walk', 'cardio', 'elliptical', 'rowing'],
        strength: ['gym', 'lift', 'weight', 'bench', 'squat', 'deadlift', 'press', 'curl', 'strength', 'resistance'],
        flexibility: ['yoga', 'stretch', 'pilates', 'flex', 'mobility'],
    };
    const totals = { cardio: 0, strength: 0, flexibility: 0 };
    data.workouts.forEach(w => {
        const lower = w.type.toLowerCase();
        let matched = false;
        for (const [cat, keywords] of Object.entries(typeMap)) {
            if (keywords.some(k => lower.includes(k))) { totals[cat] += w.mins; matched = true; break; }
        }
        if (!matched) totals.strength += w.mins;
    });
    return totals;
  }, [data.workouts]);

  const clearAll = useCallback(() => {
    setData(() => persist({ ...DEFAULT_DATA }, userEmail));
  }, [userEmail]);

  return {
    data,
    today: getToday(),
    logWeight,
    deleteWeight,
    logWorkout,
    deleteWorkout,
    logCalories,
    deleteCalories,
    setWater,
    getWaterToday,
    getCaloriesToday,
    getThisWeekWorkouts,
    getStreak,
    getAvgWater,
    getActivitySummary,
    clearAll,
  };
}
