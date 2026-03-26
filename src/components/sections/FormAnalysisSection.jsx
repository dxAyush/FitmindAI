import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { fmtVal } from '@/lib/utils';
import { toast } from 'sonner';
import SectionHeader from './SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Activity, ShieldCheck, RotateCcw, Eye, Zap } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000';

// Extract a frame from the video at a given time (seconds) as a base64 JPEG
function extractFrame(videoEl, timeSeconds, quality = 0.82) {
  return new Promise((resolve, reject) => {
    // Guard: if video dimensions aren't resolved yet, reject cleanly
    if (!videoEl.videoWidth || !videoEl.videoHeight) {
      reject(new Error('Video dimensions not available — try again after the video loads.'));
      return;
    }
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 720 / videoEl.videoHeight);
    canvas.width = Math.round(videoEl.videoWidth * scale);
    canvas.height = Math.round(videoEl.videoHeight * scale);
    const ctx = canvas.getContext('2d');

    const onSeeked = () => {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
      videoEl.removeEventListener('seeked', onSeeked);
      videoEl.removeEventListener('error', onError);
    };
    const onError = (err) => {
      reject(err);
      videoEl.removeEventListener('seeked', onSeeked);
      videoEl.removeEventListener('error', onError);
    };

    videoEl.addEventListener('seeked', onSeeked);
    videoEl.addEventListener('error', onError);
    videoEl.currentTime = timeSeconds;
  });
}

// Pick the best frame: the one with the most visual information (highest std-dev of pixel values)
async function getBestFrame(videoEl) {
  const duration = videoEl.duration || 5;
  // Sample frames at 25%, 50%, 75% of the video
  const times = [
    duration * 0.25,
    duration * 0.5,
    duration * 0.75,
  ];

  let bestFrame = null;
  let bestVariance = -1;

  for (const t of times) {
    const b64 = await extractFrame(videoEl, t);
    // Quick "sharpness" test: render tiny version and check pixel variance
    const img = new Image();
    await new Promise(res => { img.onload = res; img.src = `data:image/jpeg;base64,${b64}`; });
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 32; sampleCanvas.height = 32;
    const sCtx = sampleCanvas.getContext('2d');
    sCtx.drawImage(img, 0, 0, 32, 32);
    const pixels = sCtx.getImageData(0, 0, 32, 32).data;
    let sum = 0, sum2 = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const lum = pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114;
      sum += lum; sum2 += lum * lum;
    }
    const n = pixels.length / 4;
    const variance = sum2 / n - (sum / n) ** 2;
    if (variance > bestVariance) { bestVariance = variance; bestFrame = b64; }
  }
  return bestFrame;
}

const PHASES = [
  { msg: 'Reading your video...', val: 18 },
  { msg: 'Extracting best frame...', val: 38 },
  { msg: 'Sending to Vision AI...', val: 60 },
  { msg: 'AI is analyzing your form...', val: 82 },
  { msg: 'Preparing your report...', val: 96 },
];

export default function FormAnalysisSection() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [progVal, setProgVal] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [exercise, setExercise] = useState('squat');
  const [extractedFrame, setExtractedFrame] = useState(null); // preview thumbnail
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { toast.error('Please upload a valid video file (MP4, MOV, etc.)'); return; }
    if (f.size > 150 * 1024 * 1024) { toast.error('Video too large. Please keep it under 150MB.'); return; }
    // Revoke previous blob URL to prevent memory leak
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setProgVal(0);
    setExtractedFrame(null);
  };

  const animateProgress = useCallback(async (targetVal, durationMs = 800) => {
    const steps = 20;
    const interval = durationMs / steps;
    return new Promise(resolve => {
      let count = 0;
      const timer = setInterval(() => {
        count++;
        setProgVal(prev => {
          const next = prev + (targetVal - prev) * 0.3;
          return count >= steps ? targetVal : next;
        });
        if (count >= steps) { clearInterval(timer); resolve(); }
      }, interval);
    });
  }, []);

  const startAnalysis = async () => {
    if (!file || !videoRef.current) return;
    setLoading(true);
    setResult(null);
    setProgVal(0);
    // Keep a stable local reference — user may click reset mid-analysis
    const videoEl = videoRef.current;

    try {
      // Phase 1 - Reading video
      setScanPhase(PHASES[0].msg);
      await animateProgress(PHASES[0].val);

      // Wait for metadata if not loaded yet
      if (!videoEl.duration || videoEl.readyState < 1) {
        await new Promise((res, rej) => {
          videoEl.onloadedmetadata = res;
          setTimeout(() => rej(new Error('Video took too long to load. Please try a shorter clip.')), 8000);
        });
      }

      // Phase 2 - Extract best frame
      setScanPhase(PHASES[1].msg);
      await animateProgress(PHASES[1].val);
      const bestFrame = await getBestFrame(videoEl);
      if (!bestFrame) throw new Error('Could not extract a frame from the video.');
      setExtractedFrame(`data:image/jpeg;base64,${bestFrame}`);

      // Phase 3 - Sending to AI
      setScanPhase(PHASES[2].msg);
      await animateProgress(PHASES[2].val);

      const token = localStorage.getItem('fitmind_token');
      if (!token) throw new Error('Please log in to use form analysis.');

      // Phase 4 - AI analyzing (start the real API call)
      setScanPhase(PHASES[3].msg);
      const progressPromise = animateProgress(PHASES[3].val, 1500);

      let response;
      try {
        response = await fetch(`${API_BASE}/api/analyze-form`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ frame: bestFrame, exercise }),
        });
      } catch {
        throw new Error('Cannot connect to server. Make sure the backend is running on port 5000.');
      }

      await progressPromise;

      // Phase 5 - Preparing report
      setScanPhase(PHASES[4].msg);
      await animateProgress(PHASES[4].val, 600);

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      if (!data.success || !data.analysis) throw new Error('Incomplete response from AI');

      const a = data.analysis;
      setResult({
        score: typeof a.score === 'number' ? Math.max(0, Math.min(100, a.score)) : 70,
        good_point: a.good_point || 'Good effort maintaining posture.',
        fix: a.fix || 'Focus on your form throughout the movement.',
        steps: Array.isArray(a.steps) ? a.steps : ['Keep your core tight.', 'Control the movement slowly.', 'Watch your alignment.'],
        safety_note: a.safety_note || 'Always warm up before heavy lifts.',
        exercise,
        timestamp: new Date().toLocaleTimeString(),
      });

      setProgVal(100);
      toast.success('AI Form Analysis Complete!', { icon: <CheckCircle2 className="w-5 h-5 text-sage" /> });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Analysis failed. Please try again.');
      setProgVal(0);
    } finally {
      setLoading(false);
      setScanPhase('');
    }
  };


  const reset = () => {
    // Revoke blob URL to prevent memory leak
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null);
    setVideoUrl(null);
    setResult(null);
    setProgVal(0);
    setExtractedFrame(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scoreColor = result
    ? result.score >= 80 ? '#7aad6e' : result.score >= 60 ? '#f59e0b' : '#ef4444'
    : '#7aad6e';

  return (
    <section id="form-analysis" className="py-30 relative z-10 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forest-light/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-10 max-md:px-6">
        <SectionHeader
          eyebrow="Vision AI"
          title="Exercise Form Corrector"
          subtitle="Upload your workout video. Our AI will grab the key frame and give you real, personalized feedback on your form — not a generic tip."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left: Upload + Video Player */}
          <div className="flex flex-col gap-5">
            <motion.div
              className={`glass-card p-8 flex flex-col items-center justify-center text-center border-dashed transition-all duration-500 min-h-[280px] ${!file ? 'hover:border-sage/40 hover:bg-sage/5 cursor-pointer' : ''}`}
              onClick={() => !file && fileInputRef.current.click()}
              layout
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />

              {!videoUrl ? (
                <>
                  <motion.div
                    className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Upload className="w-8 h-8 text-sage" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-cream mb-2">Drop your workout video here</h3>
                  <p className="text-cream/50 text-sm max-w-[280px] mb-4">Supports MP4, MOV, AVI. Up to 150MB. Make sure your full body is visible.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Squat', 'Deadlift', 'Push-up', 'Bench Press'].map(ex => (
                      <span key={ex} className="text-[11px] text-sage/70 bg-sage/10 px-3 py-1 rounded-full border border-sage/20">{ex}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full rounded-2xl aspect-video object-cover border border-white/10"
                    controls
                    preload="metadata"
                  />
                </div>
              )}
            </motion.div>

            {/* Controls */}
            {videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label className="text-cream/70 text-xs tracking-wider uppercase">Select Exercise Type</Label>
                  <Select value={exercise} onValueChange={setExercise} disabled={loading}>
                    <SelectTrigger className="bg-white/5 border-white/12 text-cream rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-forest-mid border-sage/20 text-cream">
                      <SelectItem value="squat">Squat</SelectItem>
                      <SelectItem value="deadlift">Deadlift</SelectItem>
                      <SelectItem value="bench_press">Bench Press</SelectItem>
                      <SelectItem value="overhead_press">Overhead Press</SelectItem>
                      <SelectItem value="bicep_curl">Bicep Curl</SelectItem>
                      <SelectItem value="push_up">Push Up</SelectItem>
                      <SelectItem value="lunge">Lunge</SelectItem>
                      <SelectItem value="pull_up">Pull Up</SelectItem>
                      <SelectItem value="plank">Plank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Progress bar during loading */}
                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div className="flex justify-between text-xs text-sage font-semibold uppercase tracking-widest mb-2">
                        <span className="flex items-center gap-1.5">
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                            <Zap className="w-3 h-3" />
                          </motion.span>
                          {scanPhase}
                        </span>
                        <span>{Math.round(progVal)}%</span>
                      </div>
                      <Progress value={progVal} className="h-2 bg-white/10" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <Button
                    onClick={startAnalysis}
                    disabled={loading}
                    className="flex-1 py-6 bg-gradient-to-br from-forest-light to-sage hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl border-0 shadow-[0_8px_20px_rgba(122,173,110,0.2)] text-base font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Activity className="w-4 h-4" />
                        </motion.span>
                        AI Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Analyze My Form</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={reset}
                    disabled={loading}
                    className="p-3 w-12 h-auto rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Frame preview thumbnail */}
            <AnimatePresence>
              {extractedFrame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <img src={extractedFrame} alt="Captured frame" className="w-20 h-14 object-cover rounded-lg border border-sage/20" />
                  <div>
                    <div className="text-[11px] text-sage font-bold uppercase tracking-wider mb-1">Frame Analyzed by AI</div>
                    <div className="text-xs text-cream/60">The AI evaluated this frame from your video to assess your {fmtVal(exercise)} form.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Result Area */}
          <div className="flex flex-col gap-5">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card flex flex-col items-center justify-center text-center p-16 min-h-[400px] opacity-50"
                >
                  <ShieldCheck className="w-14 h-14 mb-4 text-white/20" />
                  <p className="text-cream/40 italic text-sm">Upload a video and click "Analyze My Form" to get real AI feedback on your posture and technique.</p>
                </motion.div>

              ) : loading ? (
                <motion.div
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-8 flex flex-col gap-5 min-h-[400px]"
                >
                  <div className="h-8 w-40 animate-pulse bg-white/5 rounded-lg" />
                  <div className="h-24 w-full animate-pulse bg-white/5 rounded-xl" />
                  <div className="h-16 w-full animate-pulse bg-white/5 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 animate-pulse bg-white/5 rounded-xl" />
                    <div className="h-16 animate-pulse bg-white/5 rounded-xl" />
                  </div>
                  <p className="text-center text-xs text-cream/40 mt-auto">The Vision AI is scanning your actual form...</p>
                </motion.div>

              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-8 flex flex-col gap-6"
                >
                  {/* Header: Badge + Score Circle */}
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-sage/20 text-sage hover:bg-sage/30 border-sage/30 mb-2">Real AI Analysis</Badge>
                      <h3 className="text-2xl font-bold text-cream">{fmtVal(result.exercise)} Report</h3>
                      <p className="text-xs text-cream/40 mt-1">Analyzed at {result.timestamp}</p>
                    </div>
                    {/* Circular score indicator */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                        <motion.circle
                          cx="40" cy="40" r="34"
                          stroke={scoreColor}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={213.6}
                          initial={{ strokeDashoffset: 213.6 }}
                          animate={{ strokeDashoffset: 213.6 - (213.6 * result.score) / 100 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-bold text-cream leading-none">{result.score}</span>
                        <span className="text-[9px] text-cream/50 uppercase tracking-wider mt-0.5">Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Good Point */}
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex gap-3 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-green-400 tracking-wider mb-1">What you did well</div>
                      <p className="text-sm text-cream/80 leading-relaxed">{result.good_point}</p>
                    </div>
                  </div>

                  {/* Main Fix */}
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider mb-1">Main thing to improve</div>
                      <p className="text-sm text-cream/80 leading-relaxed">{result.fix}</p>
                    </div>
                  </div>

                  {/* Fix Steps */}
                  <div className="p-4 rounded-xl bg-sage/5 border border-sage/15">
                    <div className="text-[10px] font-bold uppercase text-sage tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity className="w-3 h-3" /> How to fix it — step by step
                    </div>
                    <ol className="flex flex-col gap-2">
                      {result.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-cream/80">
                          <span className="w-5 h-5 rounded-full bg-sage/20 text-sage text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Safety Note */}
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-2 items-start">
                    <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-cream/60 leading-relaxed"><span className="text-blue-400 font-semibold">Safety: </span>{result.safety_note}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
