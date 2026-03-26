import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { callAI, getBMICategory } from '@/lib/api';
import { fmtVal } from '@/lib/utils';
import { toast } from 'sonner';
import { Scale } from 'lucide-react';
import SectionHeader from './SectionHeader';

function BMIGauge({ color, rotation, dashLength }) {
  return (
    <div className="w-[220px] h-[120px] relative mx-auto mb-8 overflow-visible">
      <svg className="w-[220px] h-[120px] overflow-visible" viewBox="0 0 220 130">
        <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <path
          d="M 20 110 A 90 90 0 0 1 200 110"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dashLength} 283`}
          className="transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
        <line
          x1="110" y1="110" x2="110" y2="28"
          stroke="white" strokeWidth="3" strokeLinecap="round"
          style={{
            transformOrigin: '110px 110px',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 1s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
        <circle cx="110" cy="110" r="6" fill="white" />
      </svg>
    </div>
  );
}

export default function BMISection() {
  const [unit, setUnit] = useState('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) { toast.error('Please enter height and weight'); return; }

    const weightKg = unit === 'metric' ? w : w * 0.453592;
    const heightM = unit === 'metric' ? h / 100 : h * 0.0254;
    const bmi = weightKg / (heightM * heightM);
    const cat = getBMICategory(bmi);

    setResult({ bmi, ...cat });
    setInsight('');
    setLoading(true);

    try {
      const prompt = `You are a friendly health coach. Give a 2-3 sentence tip in very simple English for someone with:
      - BMI: ${bmi.toFixed(1)} (${cat.category})
      - Age: ${age || 'not specified'}
      Explain what this means in plain words and give one easy tip they can start today. No big medical words. Be very encouraging. No markdown headers.`;
      const text = await callAI(prompt);
      setInsight(text);
    } catch (err) {
      setInsight(`AI Insights currently unavailable: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="bmi" className="py-30 relative z-10">
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-6">
        <SectionHeader eyebrow="Health Assessment" title="BMI Analyzer" subtitle="Calculate your Body Mass Index and receive personalized AI insights about your health status." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="glass-card p-11 max-md:p-7">
            {/* Unit Toggle */}
            <div className="inline-flex rounded-full p-1 mb-6 border border-white/12" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setUnit('metric')}
                className={`px-5 py-2 rounded-full text-sm font-medium border-0 cursor-pointer transition-all duration-400 ${unit === 'metric' ? 'bg-forest-light text-cream shadow-md' : 'bg-transparent text-cream/50'}`}
              >
                Metric
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={`px-5 py-2 rounded-full text-sm font-medium border-0 cursor-pointer transition-all duration-400 ${unit === 'imperial' ? 'bg-forest-light text-cream shadow-md' : 'bg-transparent text-cream/50'}`}
              >
                Imperial
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-7 max-sm:grid-cols-1">
              <div className="flex flex-col gap-2">
                <Label className="text-cream/80 text-xs tracking-wider uppercase">{unit === 'metric' ? 'Height (cm)' : 'Height (inches)'}</Label>
                <Input type="number" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} placeholder={unit === 'metric' ? '175' : '69'} value={height} onChange={e => setHeight(e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-cream/80 text-xs tracking-wider uppercase">{unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</Label>
                <Input type="number" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} placeholder={unit === 'metric' ? '70' : '154'} value={weight} onChange={e => setWeight(e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-cream/80 text-xs tracking-wider uppercase">Age</Label>
                <Input type="number" min="0" onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} placeholder="25" value={age} onChange={e => setAge(e.target.value)} className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-cream/80 text-xs tracking-wider uppercase">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl py-3.5 h-auto">
                    <SelectValue>{gender ? fmtVal(gender) : 'Select Gender'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculate} className="w-full py-6 rounded-full text-base bg-gradient-to-br from-forest-light to-sage hover:from-sage hover:to-forest-bright shadow-[0_8px_32px_var(--glow-green)] hover:shadow-[0_16px_48px_var(--glow-green)] hover:-translate-y-1 transition-all duration-400 border-0">
              Calculate BMI & Get Insights
            </Button>
          </div>

          {/* Result */}
          <div className="glass-card p-11 max-md:p-7 min-h-[400px] flex flex-col items-center justify-center text-center">
            {!result ? (
              <div className="text-cream/50 text-sm leading-relaxed">
                <Scale className="w-12 h-12 mx-auto mb-3 opacity-40 text-sage" />
                <p>Enter your measurements and click calculate to see your BMI score and personalized AI health insights.</p>
              </div>
            ) : (
              <div className="w-full">
                <BMIGauge color={result.color} rotation={result.rotation} dashLength={result.dashLength} />
                <div className="font-[var(--font-display)] text-5xl font-extrabold text-cream leading-none mb-1">{result.bmi.toFixed(1)}</div>
                <div
                  className="text-base font-medium px-5 py-1.5 rounded-full mb-6 inline-block"
                  style={{ background: `${result.color}22`, color: result.color, border: `1px solid ${result.color}44` }}
                >
                  {result.category}
                </div>
                <div className="bg-sage/[0.06] border border-sage/20 rounded-[14px] p-5 text-left text-sm leading-relaxed text-cream/80 w-full max-h-[200px] overflow-y-auto">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sage uppercase tracking-wider mb-2.5">🤖 AI Health Insights</div>
                  {loading ? (
                    <div className="flex items-center gap-2.5 text-cream/50">
                      <div className="w-4.5 h-4.5 border-2 border-sage/30 border-t-sage rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                      Generating insights...
                    </div>
                  ) : (
                    <div>{insight}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
