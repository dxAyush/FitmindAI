import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { callAI, parseJSON } from '@/lib/api';
import { fmtVal } from '@/lib/utils';
import { toast } from 'sonner';
import SectionHeader from './SectionHeader';
import { motion } from 'framer-motion';
import { Coffee, Sun, Moon, Apple, Sparkles } from 'lucide-react';

function MealCard({ day, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="p-7 rounded-2xl border border-white/[0.08] transition-all duration-400 hover:-translate-y-1 hover:border-sage/25 hover:bg-sage/[0.04]"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
        <span className="font-[var(--font-display)] text-xs font-bold text-sage uppercase tracking-widest">{day.day || `Day ${index + 1}`}</span>
        <span className="text-xs text-gold bg-gold/10 px-2.5 py-1 rounded-full">~{day.calories || '?'} kcal</span>
      </div>
      {[
        { type: 'Breakfast', icon: Coffee, val: day.breakfast },
        { type: 'Lunch', icon: Sun, val: day.lunch },
        { type: 'Dinner', icon: Moon, val: day.dinner },
        { type: 'Snack', icon: Apple, val: day.snack },
      ].map(({ type, icon: Icon, val }) => (
        <div key={type} className="mb-3">
          <div className="text-[0.72rem] font-semibold text-cream/50 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" /> {type}
          </div>
          <div className="text-sm text-cream/80 leading-snug">{val || '—'}</div>
        </div>
      ))}
    </motion.div>
  );
}

export default function DietSection() {
  const [form, setForm] = useState({ age: '', weight: '', height: '', gender: '', goal: '', activity: '', dietType: 'balanced', allergies: '' });
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const generate = async () => {
    if (!form.goal || !form.activity) { toast.error('Please fill in your goal and activity level'); return; }
    setLoading(true);
    try {
      const prompt = `You are a friendly nutrition coach. Create a 7-day meal plan in plain English. 
      Use simple food names and easy cooking steps. Avoid complex nutrition jargon. 
      Format as a JSON array of 7 days.
      Profile: age=${form.age || '25'}, weight=${form.weight || '70'}kg, height=${form.height || '175'}cm, goal=${form.goal}, activity=${form.activity}, diet=${form.dietType}${form.allergies ? `, allergies/dislikes=${form.allergies}` : ''}
      ${form.allergies ? `IMPORTANT: Do NOT include any of these ingredients: ${form.allergies}. This is non-negotiable.` : ''}
      
      Return ONLY a JSON array of 7 objects with this structure (no other text):
      [
        {
          "day": "Monday",
          "calories": "1800",
          "breakfast": "Meal name and 1-sentence description",
          "lunch": "Meal name and 1-sentence description",
          "dinner": "Meal name and 1-sentence description",
          "snack": "One snack name"
        }
      ]`;
      const raw = await callAI(prompt);
      const parsed = parseJSON(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setPlans(arr);
      toast.success('7-day meal plan generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="diet" className="py-30 relative z-10" style={{ background: 'rgba(13,31,15,0.4)' }}>
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-6">
        <SectionHeader eyebrow="Nutrition" title="AI Diet Planner" subtitle="Get a personalized 7-day meal plan crafted by Groq Llama 3 based on your unique profile and goals." />

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-13 max-md:p-7">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-7">
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Age</Label>
              <Input type="number" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} placeholder="25" value={form.age} onChange={e => update('age', e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Weight (kg)</Label>
              <Input type="number" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} placeholder="70" value={form.weight} onChange={e => update('weight', e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Height (cm)</Label>
              <Input type="number" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} placeholder="175" value={form.height} onChange={e => update('height', e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Gender</Label>
              <Select value={form.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5 h-auto">
                  <SelectValue>{form.gender ? fmtVal(form.gender) : 'Select'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Fitness Goal</Label>
              <Select value={form.goal} onValueChange={v => update('goal', v)}>
                <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5 h-auto">
                  <SelectValue>{form.goal ? fmtVal(form.goal) : 'Select goal'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general_health">General Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Activity Level</Label>
              <Select value={form.activity} onValueChange={v => update('activity', v)}>
                <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5 h-auto">
                  <SelectValue>{form.activity ? fmtVal(form.activity) : 'Select level'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Diet Type</Label>
              <Select value={form.dietType} onValueChange={v => update('dietType', v)}>
                <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5 h-auto">
                  <SelectValue>{form.dietType ? fmtVal(form.dietType) : 'Select'}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Ketogenic</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="intermittent_fasting">Intermittent Fasting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-cream/80 text-xs tracking-wider uppercase">Food Allergies / Dislikes</Label>
              <Input type="text" placeholder="e.g. nuts, dairy, gluten" value={form.allergies} onChange={e => update('allergies', e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="flex items-center gap-2.5 py-6 px-8 rounded-full text-base bg-gradient-to-br from-forest-light to-sage hover:from-sage hover:to-forest-bright shadow-[0_8px_32px_var(--glow-green)] hover:-translate-y-1 transition-all duration-400 border-0 disabled:opacity-60">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                Generating your plan...
              </>
            ) : (
              <><span><Sparkles className="w-5 h-5" /></span> Generate 7-Day Meal Plan</>
            )}
          </Button>
        </motion.div>

        {plans && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mt-9">
            {plans.map((day, i) => <MealCard key={i} day={day} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}
