import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { callAI, parseJSON } from '@/lib/api';
import { toast } from 'sonner';
import SectionHeader from './SectionHeader';
import { motion } from 'framer-motion';
import { Plus, Dumbbell } from 'lucide-react';

function WorkoutDayItem({ day, index }) {
  const [expanded, setExpanded] = useState(false);
  const dayNums = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
  const exercises = Array.isArray(day.exercises) ? day.exercises : [day.exercises];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="rounded-[14px] border border-white/[0.08] overflow-hidden transition-all duration-400 hover:border-sage/22"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-6 py-5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-forest-light to-sage flex items-center justify-center font-[var(--font-display)] text-xs font-bold text-white flex-shrink-0">
            {dayNums[index] || `D${index + 1}`}
          </div>
          <div>
            <div className="font-[var(--font-display)] font-semibold text-base text-cream">{day.day || `Day ${index + 1}`}</div>
            <div className="text-sm text-cream/50">{day.focus || ''} · {day.duration || ''}</div>
          </div>
        </div>
        <span className={`text-sage text-xl transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}>+</span>
      </div>

      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] px-6"
        style={{ maxHeight: expanded ? '600px' : '0', paddingBottom: expanded ? '24px' : '0' }}
      >
        {/* Warmup */}
        <div className="mb-3 p-3 rounded-[10px]" style={{ background: 'rgba(122,173,110,0.06)' }}>
          <div className="text-[0.75rem] text-sage font-semibold uppercase tracking-wider mb-1">Warm-up</div>
          <div className="text-sm text-cream/80">{day.warmup || 'Dynamic stretching, 5 min'}</div>
        </div>

        {/* Exercises */}
        <ul className="list-none flex flex-col gap-2">
          {exercises.map((ex, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-cream/80 leading-snug">
              <span className="text-sage flex-shrink-0 mt-0.5">▸</span>
              {ex}
            </li>
          ))}
        </ul>

        {/* Cooldown */}
        <div className="mt-3 p-3 rounded-[10px]" style={{ background: 'rgba(201,168,76,0.06)' }}>
          <div className="text-[0.75rem] text-gold font-semibold uppercase tracking-wider mb-1">Cool-down</div>
          <div className="text-sm text-cream/80">{day.cooldown || 'Static stretching, 5 min'}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkoutSection() {
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('fitmind_workout_form');
    return saved ? JSON.parse(saved) : { level: 'beginner', goal: 'weight_loss', days: '3', duration: '45', equipment: 'none', injuries: '' };
  });
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('fitmind_workout_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('fitmind_workout_form', JSON.stringify(form));
    if (plan) localStorage.setItem('fitmind_workout_plan', JSON.stringify(plan));
  }, [form, plan]);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `You are a professional personal trainer. Create a highly personalized ${form.days}-day weekly workout program.
      
      USER PROFILE:
      - Goal: ${form.goal.replaceAll('_', ' ')}
      - Level: ${form.level}
      - Equipment: ${form.equipment.replaceAll('_', ' ')}
      - Session Duration: ${form.duration} minutes
      - Limitations/Injuries: ${form.injuries || 'None'}
      - Number of Days: ${form.days} sessions per week

      STRICT RULES:
      1. EQUIPMENT: Use ONLY ${form.equipment.replaceAll('_', ' ')}. If 'none' is selected, use bodyweight only. NEVER suggest equipment the user doesn't have.
      2. SPLIT LOGIC: 
         - If 3 days: Create a Full Body split.
         - If 4 days: Create an Upper/Lower split.
         - If 5-6 days: Create a Push/Pull/Legs or specialized split.
      3. VARIETY: Every day MUST be different. Do not repeat the same exercises on different days.
      4. INTENSITY: 
         - If goal is Strength: focus on 3-5 reps with long rest.
         - If goal is Muscle Building: focus on 8-12 reps with 1-2 min rest.
         - If goal is Weight Loss: focus on 15-20 reps with short 30-45s rest.
      5. FORMAT: Return ONLY a raw JSON array of ${form.days} objects. No markdown, no intro text.

      STRUCTURE:
      [
        {
          "day": "Day 1 (e.g. Monday - Chest & Back)",
          "focus": "Brief focus description",
          "warmup": "Specific 5-min warmup",
          "exercises": [
            "Exercise Name: Sets x Reps - specific form tip",
            "Exercise Name: Sets x Reps - specific form tip",
            "..." (at least 5-7 exercises per session)
          ],
          "cooldown": "Specific stretch for the muscles worked",
          "duration": "${form.duration} min"
        }
      ]`;
      
      const raw = await callAI(prompt);
      const parsed = parseJSON(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setPlan(arr);
      toast.success('Weekly workout plan created!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate workout plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="workout" className="py-30 relative z-10" style={{ background: 'rgba(13,31,15,0.2)' }}>
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-6">
        <SectionHeader eyebrow="Training" title="AI Workout Planner" subtitle="Your complete weekly training program, intelligently designed for your fitness level and goals." />

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-13 max-md:p-7">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-7">
            {[
              { label: 'Fitness Level', key: 'level', options: [['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced'],['athlete','Athlete']] },
              { label: 'Primary Goal', key: 'goal', options: [['weight_loss','Weight Loss'],['muscle_building','Muscle Building'],['strength','Strength'],['endurance','Endurance'],['flexibility','Flexibility & Mobility'],['general_fitness','General Fitness']] },
              { label: 'Days Per Week', key: 'days', options: [['3','3 days'],['4','4 days'],['5','5 days'],['6','6 days']] },
              { label: 'Session Duration', key: 'duration', options: [['30','30 minutes'],['45','45 minutes'],['60','60 minutes'],['90','90 minutes']] },
              { label: 'Available Equipment', key: 'equipment', options: [['none','No Equipment (Bodyweight)'],['resistance_bands','Resistance Bands'],['dumbbells','Dumbbells Only'],['home_gym','Home Gym Setup'],['full_gym','Full Gym Access']] },
            ].map(({ label, key, options }) => {
              const selectedOpt = options.find(o => o[0] === form[key]);
              const displayTxt = selectedOpt ? selectedOpt[1] : 'Select';
              return (
              <div key={key} className="flex flex-col gap-2">
                <Label className="text-cream/80 text-xs tracking-wider uppercase">{label}</Label>
                <Select value={form[key]} onValueChange={v => update(key, v)}>
                  <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5 h-auto">
                    <SelectValue>{displayTxt}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                    {options.map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )})}
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Injuries / Limitations</Label>
              <Input type="text" placeholder="e.g. bad knee, lower back pain" value={form.injuries} onChange={e => update('injuries', e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="flex items-center gap-2.5 py-6 px-8 rounded-full text-base bg-gradient-to-br from-forest-light to-sage hover:from-sage hover:to-forest-bright shadow-[0_8px_32px_var(--glow-green)] hover:-translate-y-1 transition-all duration-400 border-0 disabled:opacity-60">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> Designing your program...</>
            ) : (
              <><span><Dumbbell className="w-5 h-5" /></span> Generate Weekly Workout Plan</>
            )}
          </Button>
        </motion.div>

        {plan && (
          <div className="flex flex-col gap-3 mt-9">
            {plan.map((day, i) => <WorkoutDayItem key={i} day={day} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}
