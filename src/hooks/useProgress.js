import { useState, useCallback } from 'react';

const DEFAULT_DATA = { weights: [], workouts: [], water: {}, calories: [] };

// Always returns the current date string — prevents stale date if app stays open past midnight
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem('fitmind_progress'));
    if (!parsed) return { ...DEFAULT_DATA };
    // Merge existing with defaults to prevent missing properties like calories
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

// Persist data to localStorage and return newData (used in functional updaters)
function persist(newData) {
  localStorage.setItem('fitmind_progress', JSON.stringify(newData));
  return newData;
}

export function useProgress() {
  const [data, setData] = useState(loadProgress);

  // All mutations use the functional updater form of setData so they always
  // operate on the latest state — no stale closures, no lag.

  const logWeight = useCallback((val, date) => {
    setData(prev => persist({ ...prev, weights: [{ val, date }, ...prev.weights].slice(0, 30) }));
  }, []);

  const deleteWeight = useCallback((index) => {
    setData(prev => {
      const newWeights = [...prev.weights];
      newWeights.splice(index, 1);
      return persist({ ...prev, weights: newWeights });
    });
  }, []);

  const logWorkout = useCallback((type, mins) => {
    const dateStr = new Date().toISOString().split('T')[0];
    setData(prev => persist({
      ...prev,
      workouts: [{ type, mins, date: dateStr }, ...prev.workouts].slice(0, 50),
    }));
  }, []);

  const deleteWorkout = useCallback((index) => {
    setData(prev => {
      const newWorkouts = [...prev.workouts];
      newWorkouts.splice(index, 1);
      return persist({ ...prev, workouts: newWorkouts });
    });
  }, []);

  const logCalories = useCallback((item, cal, explanation) => {
    const dateStr = new Date().toISOString().split('T')[0];
    setData(prev => persist({
      ...prev,
      calories: [{ item, cal, explanation, date: dateStr }, ...(prev.calories || [])].slice(0, 50),
    }));
  }, []);

  const deleteCalories = useCallback((index) => {
    setData(prev => {
      const newCal = [...(prev.calories || [])];
      newCal.splice(index, 1);
      return persist({ ...prev, calories: newCal });
    });
  }, []);

  const setWater = useCallback((count) => {
    const key = new Date().toISOString().split('T')[0];
    setData(prev => persist({ ...prev, water: { ...prev.water, [key]: count } }));
  }, []);

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
    setData(() => persist({ ...DEFAULT_DATA }));
  }, []);

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
