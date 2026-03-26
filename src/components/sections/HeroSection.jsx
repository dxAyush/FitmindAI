import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Scale, Salad, Video, Activity, Bot, TrendingUp, Sparkles } from 'lucide-react';

const features = [
  { icon: Scale, title: 'BMI Analyzer', desc: 'AI health assessment', href: '#bmi', color: 'text-blue-400' },
  { icon: Salad, title: 'Diet Planner', desc: '7-day personalized meals', href: '#diet', color: 'text-green-400' },
  { icon: Video, title: 'Form AI', desc: 'Real-time form correction', href: '#form-analysis', color: 'text-purple-400' },
  { icon: Activity, title: 'Workout AI', desc: 'Custom training programs', href: '#workout', color: 'text-red-400' },
  { icon: Bot, title: 'AI Coach', desc: '24/7 fitness guidance', href: '#chat', color: 'text-gold' },
  { icon: TrendingUp, title: 'Metrics', desc: 'Track your transformation', href: '#progress', color: 'text-sage' },
];

const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

export default function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center text-center px-10 py-20 pt-30 relative z-10 overflow-hidden">
      <div className="max-w-[900px] relative">
        {/* Eyebrow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'backOut', delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[0.82rem] font-medium tracking-wider uppercase mb-7 border border-sage/25"
          style={{
            background: 'var(--glass-bg)',
            color: 'var(--sage-light)',
            backdropFilter: 'blur(10px)',
            animation: 'float-gentle 4s ease-in-out infinite',
          }}
        >
          <Sparkles className="w-3 h-3 text-gold" />
          Powered by Groq AI
        </motion.div>

        {/* Title */}
        <h1 className="font-[var(--font-display)] text-[clamp(3rem,7vw,6.5rem)] font-extrabold leading-[1.0] tracking-tight mb-6">
          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="block text-cream"
          >
            Your Intelligent
          </motion.span>
          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="block bg-gradient-to-br from-sage-light via-gold-light to-sage bg-clip-text text-transparent"
            style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}
          >
            Fitness Partner
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
          className="text-[1.1rem] text-cream/80 max-w-[560px] mx-auto mb-12 leading-relaxed font-light"
        >
          Personalized AI-driven plans for diet, workouts, and wellness — all built around you, your goals, and your lifestyle.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.9 }}
          className="flex gap-4 justify-center flex-wrap mb-18"
        >
          <Button
            onClick={() => scrollTo('#diet')}
            className="px-9 py-6 text-[0.95rem] rounded-full font-medium bg-gradient-to-br from-forest-light to-sage hover:from-sage hover:to-forest-bright shadow-[0_8px_32px_var(--glow-green)] hover:shadow-[0_16px_48px_var(--glow-green)] hover:-translate-y-1 transition-all duration-400 border-0"
          >
            Start Your Journey
          </Button>
          <Button
            variant="outline"
            onClick={() => scrollTo('#chat')}
            className="px-9 py-6 text-[0.95rem] rounded-full font-medium border-sage/35 text-sage-light bg-transparent hover:bg-sage/12 hover:border-sage hover:-translate-y-1 hover:shadow-[0_8px_30px_var(--glow-green)] transition-all duration-400"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            Talk to AI Coach →
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 max-w-[800px] mx-auto">
          {features.map(({ icon: Icon, title, desc, href, color }, i) => (
            <motion.div
              key={title}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 1.1 + i * 0.1 }}
              onClick={() => scrollTo(href)}
              className="p-6 px-5 rounded-[20px] border border-white/[0.08] cursor-pointer transition-all duration-400 hover:-translate-y-2 hover:border-sage/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.8),0_8px_30px_rgba(122,173,110,0.15)] relative overflow-hidden group"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sage/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Icon className={`w-8 h-8 mb-4 block ${color}`} />
              <div className="font-[var(--font-display)] text-[0.9rem] font-semibold text-cream mb-1 relative z-[1]">{title}</div>
              <div className="text-[0.78rem] text-cream/50 leading-snug relative z-[1]">{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/50 text-xs tracking-widest uppercase">
        <div
          className="w-[22px] h-9 border-2 border-sage/30 rounded-[11px] flex justify-center pt-1.5"
        >
          <span className="w-1 h-2 bg-sage rounded-sm" style={{ animation: 'scroll-down 2s infinite' }} />
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
}
