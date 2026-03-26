const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const footerLinks = [
  { label: 'Home', id: 'hero' },
  { label: 'BMI', id: 'bmi' },
  { label: 'Diet', id: 'diet' },
  { label: 'Workout', id: 'workout' },
  { label: 'Chat', id: 'chat' },
  { label: 'Progress', id: 'progress' },
];

export default function Footer() {
  return (
    <footer className="py-20 pb-15 text-center relative z-10 border-t border-sage/10" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="max-w-[1200px] mx-auto px-10">
        <div className="font-[var(--font-display)] text-3xl font-extrabold bg-gradient-to-br from-sage-light to-gold-light bg-clip-text text-transparent mb-3">
          FitMind AI
        </div>
        <div className="text-muted-foreground text-sm mb-7">
          Intelligent fitness for extraordinary results
        </div>
        <ul className="flex gap-6 justify-center list-none mb-8 flex-wrap">
          {footerLinks.map(({ label, id }) => (
            <li key={id}>
              <a
                onClick={() => scrollTo(id)}
                className="text-muted-foreground no-underline text-sm cursor-pointer transition-colors duration-200 hover:text-sage-light"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="text-muted-foreground text-xs">
          © 2026 FitMind AI · Built with Groq & Llama 3 · All rights reserved
        </div>
      </div>
    </footer>
  );
}
