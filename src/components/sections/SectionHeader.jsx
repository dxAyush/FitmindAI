import { motion } from 'framer-motion';

export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
      className="text-center mb-15"
    >
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-sage tracking-[0.12em] uppercase mb-4">
        <span className="block w-8 h-px bg-sage/50" />
        {eyebrow}
        <span className="block w-8 h-px bg-sage/50" />
      </div>
      <h2 className="font-[var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] font-bold text-cream leading-[1.15] tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-cream/80 max-w-[520px] mx-auto font-light">{subtitle}</p>
      )}
    </motion.div>
  );
}
