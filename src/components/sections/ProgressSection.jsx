import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useProgress } from '@/hooks/useProgress';
import { callAI, parseJSON } from '@/lib/api';
import { toast } from 'sonner';
import SectionHeader from './SectionHeader';
import { motion } from 'framer-motion';
import { Scale, Activity, Droplets, BarChart3, Apple, Trash2, Calendar } from 'lucide-react';

function StatsOverview({ streak, workouts, avgWater }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-7">
      {[
        { val: streak, label: 'Day Streak' },
        { val: workouts, label: 'Workouts' },
        { val: avgWater + 'L', label: 'Avg Water' },
      ].map(({ val, label }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 text-center rounded-[14px] border border-white/[0.08] transition-all duration-400 hover:border-sage/20 hover:-translate-y-1"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="font-[var(--font-display)] text-3xl font-bold text-cream leading-none mb-1">{val}</div>
          <div className="text-xs text-cream/50 uppercase tracking-wider">{label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function WeightTracker({ data, logWeight, deleteWeight }) {
  const [val, setVal] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const canvasRef = useRef(null);

  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const weights = [...data.weights].reverse().slice(-14);
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = 120;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (weights.length < 2) {
      ctx.fillStyle = 'rgba(122,173,110,0.3)';
      ctx.font = '13px DM Sans';
      ctx.textAlign = 'center';
      ctx.fillText('Log 2+ entries to see chart', W / 2, H / 2);
      return;
    }

    const vals = weights.map(w => w.val);
    const min = Math.min(...vals) - 1;
    const max = Math.max(...vals) + 1;
    const px = (v) => H - ((v - min) / (max - min)) * (H - 20) - 10;
    const py = (i) => (i / (weights.length - 1)) * (W - 20) + 10;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = 10 + (i / 3) * (H - 20);
      ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(W - 10, y); ctx.stroke();
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(122,173,110,0.3)');
    grad.addColorStop(1, 'rgba(122,173,110,0)');
    ctx.beginPath();
    ctx.moveTo(py(0), H);
    weights.forEach((w, i) => ctx.lineTo(py(i), px(w.val)));
    ctx.lineTo(py(weights.length - 1), H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#7aad6e';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    weights.forEach((w, i) => { i === 0 ? ctx.moveTo(py(i), px(w.val)) : ctx.lineTo(py(i), px(w.val)); });
    ctx.stroke();

    // Dots
    weights.forEach((w, i) => {
      ctx.beginPath();
      ctx.arc(py(i), px(w.val), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7aad6e';
      ctx.fill();
      ctx.strokeStyle = '#0d1f0f';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [data.weights]);

  useEffect(() => { renderChart(); }, [renderChart]);
  useEffect(() => { window.addEventListener('resize', renderChart); return () => window.removeEventListener('resize', renderChart); }, [renderChart]);

  const handleLog = () => {
    const v = parseFloat(val);
    if (!v || v <= 0) { toast.error('Please enter a valid positive weight'); return; }
    if (!date) { toast.error('Please select a date'); return; }
    logWeight(v, date);
    setVal('');
    toast.success(`${v}kg weight logged!`, { icon: <Scale className="w-5 h-5 text-sage" /> });
  };

  return (
    <div className="glass-card p-9 max-md:p-7">
      <div className="font-[var(--font-display)] text-lg font-semibold text-cream mb-6 flex items-center gap-2.5">
        <Scale className="w-5 h-5 text-sage" /> Weight Log
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input type="number" placeholder="kg" step="0.1" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={val} onChange={e => setVal(e.target.value)} className="flex-1 min-w-[120px] bg-white/5 border-white/12 text-cream rounded-[10px] py-3" />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-[2] bg-white/5 border-white/12 text-cream rounded-[10px] py-3" />
        <Button onClick={handleLog} className="px-5 py-3 bg-gradient-to-br from-forest-light to-sage rounded-[10px] text-sm font-medium border-0 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--glow-green)] transition-all whitespace-nowrap">Log</Button>
      </div>
      <canvas ref={canvasRef} className="w-full" height="120" />
      <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2 mt-4">
        {data.weights.slice(0, 8).map((w, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-[10px] text-sm border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)', animation: 'slide-up 0.3s ease' }}>
            <span className="text-xs text-cream/50">{w.date}</span>
            <span className="text-sage-light font-medium">{w.val} kg</span>
            <button onClick={() => deleteWeight(i)} className="bg-transparent border-0 text-cream/50 cursor-pointer text-sm px-1.5 py-0.5 rounded-md transition-all hover:text-red-500 hover:bg-red-500/10">✕</button>
          </div>
        ))}
        {data.weights.length === 0 && <div className="text-cream/50 text-xs py-3">No entries yet. Log your first weight!</div>}
      </div>
    </div>
  );
}

function WorkoutTrackerCard({ data, logWorkout: logWo, deleteWorkout, getThisWeekWorkouts }) {
  const [type, setType] = useState('');
  const [mins, setMins] = useState('');
  const weekWorkouts = getThisWeekWorkouts();
  const goal = 4;
  const pct = Math.min((weekWorkouts / goal) * 100, 100);

  const handleLog = () => {
    const m = parseFloat(mins);
    if (!type.trim()) { toast.error('Please enter workout type'); return; }
    if (!m || m <= 0) { toast.error('Please enter a valid duration (minutes > 0)'); return; }
    logWo(type.trim(), m);
    setType(''); setMins('');
    toast.success(`${type} (${m}min) logged!`, { icon: <Activity className="w-5 h-5 text-sage" /> });
  };

  return (
    <div className="glass-card p-9 max-md:p-7">
      <div className="font-[var(--font-display)] text-lg font-semibold text-cream mb-6 flex items-center gap-2.5">
        <Activity className="w-5 h-5 text-forest-bright" /> Workout Log
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input type="text" placeholder="e.g. Run, Gym" value={type} onChange={e => setType(e.target.value)} className="flex-[2] bg-white/5 border-white/12 text-cream rounded-[10px] py-3" />
        <Input type="number" placeholder="mins" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={mins} onChange={e => setMins(e.target.value)} className="flex-1 min-w-[80px] bg-white/5 border-white/12 text-cream rounded-[10px] py-3" />
        <Button onClick={handleLog} className="px-5 py-3 bg-gradient-to-br from-forest-light to-sage rounded-[10px] text-sm font-medium border-0 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--glow-green)] transition-all whitespace-nowrap">Log</Button>
      </div>
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-cream/80">Weekly Goal</span>
          <span className="text-sage-light font-medium">{weekWorkouts} / {goal} sessions</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full bg-gradient-to-r from-forest-bright to-sage transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ width: pct + '%' }} />
        </div>
      </div>
      <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2">
        {data.workouts.slice(0, 6).map((w, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-[10px] text-sm border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs text-cream/50">{w.date}</span>
            <span className="text-cream">{w.type}</span>
            <span className="text-sage-light font-medium">{w.mins} min</span>
            <button onClick={() => deleteWorkout(i)} className="bg-transparent border-0 text-cream/50 cursor-pointer text-sm px-1.5 py-0.5 rounded-md transition-all hover:text-red-500 hover:bg-red-500/10">✕</button>
          </div>
        ))}
        {data.workouts.length === 0 && <div className="text-cream/50 text-xs py-3">No workouts logged yet!</div>}
      </div>
    </div>
  );
}

function WaterTracker({ getWaterToday, setWater }) {
  const count = getWaterToday();
  const pct = Math.min((count / 8) * 100, 100);

  return (
    <div className="glass-card p-9 max-md:p-7">
      <div className="font-[var(--font-display)] text-lg font-semibold text-cream mb-6 flex items-center gap-2.5">
        <Droplets className="w-5 h-5 text-blue-400" /> Hydration Tracker
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            onClick={() => setWater(i < count ? i : i + 1)}
            className={`w-[38px] h-12 rounded-[6px_6px_8px_8px] border-2 cursor-pointer transition-all duration-400 relative overflow-hidden hover:scale-108 ${i < count ? 'border-sage bg-sage/20' : 'border-sage/30 bg-white/[0.03]'}`}
          >
            {i < count && <span className="absolute inset-0 flex items-center justify-center text-lg"><Droplets className="w-5 h-5 text-blue-400 fill-blue-400/30" /></span>}
          </div>
        ))}
      </div>
      <div className="text-sm text-cream/80 mb-3">
        Today: <strong className="text-sage-light">{count}</strong> / 8 glasses
        &nbsp;&nbsp;≈ <strong className="text-sage-light">{(count * 0.25).toFixed(1)}L</strong>
      </div>
      <div>
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-cream/80">Daily Hydration</span>
          <span className="text-sage-light font-medium">{Math.round(pct)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ width: pct + '%', background: 'linear-gradient(90deg,#3d7a41,#60a5fa)' }} />
        </div>
      </div>
    </div>
  );
}

function ActivitySummary({ getActivitySummary, clearAll }) {
  const totals = getActivitySummary();
  const maxVal = Math.max(...Object.values(totals), 60);

  const bars = [
    { label: 'Cardio', val: totals.cardio, bg: 'linear-gradient(90deg,#2d5a30,#7aad6e)' },
    { label: 'Strength', val: totals.strength, bg: 'linear-gradient(90deg,#3d7a41,#c9a84c)' },
    { label: 'Flexibility', val: totals.flexibility, bg: 'linear-gradient(90deg,#3d7a41,#a78bfa)' },
  ];

  return (
    <div className="glass-card p-9 max-md:p-7">
      <div className="font-[var(--font-display)] text-lg font-semibold text-cream mb-6 flex items-center gap-2.5">
        <BarChart3 className="w-5 h-5 text-gold" /> Activity Summary
      </div>
      {bars.map(({ label, val, bg }) => (
        <div key={label} className="mb-5">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-cream/80">{label}</span>
            <span className="text-sage-light font-medium">{val} min</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ width: (val / maxVal * 100) + '%', background: bg }} />
          </div>
        </div>
      ))}
      <Button
        onClick={() => { if (confirm('Clear all progress data? This cannot be undone.')) { clearAll(); toast.success('All data cleared'); } }}
        className="w-full mt-5 py-3 bg-gradient-to-br from-forest-light to-sage rounded-[10px] text-sm font-medium border-0 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--glow-green)] transition-all"
      >
        <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset All Data</span>
      </Button>
    </div>
  );
}

function AICalorieTracker({ data, logCalories, deleteCalories, getCaloriesToday }) {
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLog = async () => {
    if (!foodInput.trim()) { toast.error('Please enter what you ate'); return; }
    setLoading(true);
    try {
      const prompt = `You are a helpful calorie counting AI in a fitness app. The user ate: "${foodInput}". 
      Estimate the calories. The user might use natural Indian measurements like "1 bowl of dal", "2 rotis", "1 cup chai". 
      Teach them about the calories in this item (macronutrients briefly).
      Return ONLY a JSON object with this exact structure:
      {
        "item": "Cleaned up name of the food",
        "calories": 250,
        "explanation": "A short 1-2 sentence educational breakdown of where the calories come from."
      }`;
      const raw = await callAI(prompt);
      const parsed = parseJSON(raw);
      if(parsed && typeof parsed.calories === 'number') {
        logCalories(parsed.item || foodInput, parsed.calories, parsed.explanation || '');
        setFoodInput('');
        toast.success(`Added ${parsed.calories} kcal!`, { icon: <Apple className="w-5 h-5 text-red-400" /> });
      } else {
        throw new Error('Invalid AI response');
      }
    } catch(err) {
      console.error(err);
      toast.error('Failed to estimate calories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalToday = getCaloriesToday();

  return (
    <div className="glass-card p-9 max-md:p-7 md:col-span-2">
      <div className="font-[var(--font-display)] text-lg font-semibold text-cream mb-6 flex items-center gap-2.5">
        <Apple className="w-6 h-6 text-red-500" /> AI Calorie Tracker & Educator
      </div>
      <div className="mb-4 text-sm text-cream/70">
        Skip the weighing scale. Just type what you ate normally (e.g. "1 bowl of dal", "2 small rotis", "a handful of almonds") and the AI will estimate the calories and teach you about its nutrition!
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input 
          type="text" 
          placeholder="What did you eat? e.g. 1 big bowl of paneer butter masala..." 
          value={foodInput} 
          onChange={e => setFoodInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleLog()}
          className="flex-[2] min-w-[200px] bg-white/5 border-white/12 text-cream rounded-[10px] py-3 placeholder:text-cream/30" 
          disabled={loading}
        />
        <Button onClick={handleLog} disabled={loading} className="px-6 py-3 bg-gradient-to-br from-forest-light to-sage rounded-[10px] text-sm font-medium border-0 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--glow-green)] transition-all whitespace-nowrap">
          {loading ? 'Thinking...' : 'Track Calories'}
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-cream/80">Calories Today</span>
          <span className="text-gold font-medium">{totalToday} kcal</span>
        </div>
      </div>

      <div className="max-h-[250px] overflow-y-auto flex flex-col gap-3 pr-2">
        {(data.calories || []).slice(0, 10).map((c, i) => (
          <div key={i} className="flex flex-col px-4 py-3 rounded-[10px] text-sm border border-white/[0.06] bg-white/[0.02]">
             <div className="flex items-center justify-between mb-1">
                <span className="text-cream font-medium">{c.item}</span>
                <span className="text-gold font-semibold text-lg">{c.cal} kcal</span>
             </div>
             <div className="text-xs text-cream/60 leading-relaxed mb-2">
                <span className="text-sage font-medium tracking-wide uppercase text-[10px] mr-1">AI Insight:</span> {c.explanation}
             </div>
             <div className="flex items-center justify-between mt-auto">
               <span className="text-[10px] text-cream/40">{c.date}</span>
               <button onClick={() => deleteCalories(i)} className="bg-transparent border-0 text-cream/40 cursor-pointer text-xs px-2 py-1 rounded-md transition-all hover:text-red-500 hover:bg-red-500/10">Remove</button>
             </div>
          </div>
        ))}
        {!(data.calories?.length) && <div className="text-cream/50 text-xs py-3 text-center border border-dashed border-white/10 rounded-lg">No food logged yet. Type something above!</div>}
      </div>
    </div>
  );
}

export default function ProgressSection() {
  const progress = useProgress();

  return (
    <section id="progress" className="py-30 relative z-10">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-6">
        <SectionHeader eyebrow="Track & Improve" title="Progress Tracker" subtitle="Log your daily metrics and watch your transformation take shape over time." />

        <StatsOverview streak={progress.getStreak()} workouts={progress.data.workouts.length} avgWater={progress.getAvgWater()} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <AICalorieTracker data={progress.data} logCalories={progress.logCalories} deleteCalories={progress.deleteCalories} getCaloriesToday={progress.getCaloriesToday} />
          <WeightTracker data={progress.data} logWeight={progress.logWeight} deleteWeight={progress.deleteWeight} />
          <WorkoutTrackerCard data={progress.data} logWorkout={progress.logWorkout} deleteWorkout={progress.deleteWorkout} getThisWeekWorkouts={progress.getThisWeekWorkouts} />
          <WaterTracker getWaterToday={progress.getWaterToday} setWater={progress.setWater} />
          <ActivitySummary getActivitySummary={progress.getActivitySummary} clearAll={progress.clearAll} />
        </div>
      </div>
    </section>
  );
}
