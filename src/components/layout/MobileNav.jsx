import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'BMI Analyzer', href: '#bmi' },
  { label: 'Diet Planner', href: '#diet' },
  { label: 'Form AI', href: '#form-analysis' },
  { label: 'Workout', href: '#workout' },
  { label: 'AI Chat', href: '#chat' },
  { label: 'Progress', href: '#progress' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, setShowAuthModal, logout } = useAuth();

  const scrollTo = (href) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hamburger */}
      <div
        className="md:hidden fixed top-5 right-5 z-[1001] flex flex-col gap-[5px] cursor-pointer p-1.5"
        onClick={() => setOpen(!open)}
      >
        <span
          className="block w-6 h-[2px] bg-cream rounded-sm transition-all duration-400"
          style={open ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}}
        />
        <span
          className="block w-6 h-[2px] bg-cream rounded-sm transition-all duration-400"
          style={open ? { opacity: 0 } : {}}
        />
        <span
          className="block w-6 h-[2px] bg-cream rounded-sm transition-all duration-400"
          style={open ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}}
        />
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className="fixed inset-0 z-[990] flex flex-col items-center justify-center gap-2 transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden"
        style={{
          background: 'rgba(13, 31, 15, 0.97)',
          backdropFilter: 'blur(20px)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {navItems.map(({ label, href }) => (
          <a
            key={label}
            onClick={() => scrollTo(href)}
            className="font-[var(--font-display)] text-3xl font-bold text-cream/80 no-underline px-5 py-2.5 transition-colors duration-300 hover:text-sage-light cursor-pointer"
          >
            {label}
          </a>
        ))}

        {isAuthenticated ? (
          <a
            onClick={() => { setOpen(false); logout(); }}
            className="font-[var(--font-display)] text-2xl font-bold text-red-400/80 no-underline px-5 py-2.5 transition-colors duration-300 hover:text-red-400 cursor-pointer mt-4"
          >
            Log Out
          </a>
        ) : (
          <a
            onClick={() => { setOpen(false); setShowAuthModal(true); }}
            className="font-[var(--font-display)] text-3xl font-bold text-cream/80 no-underline px-5 py-2.5 transition-colors duration-300 hover:text-sage-light cursor-pointer"
          >
            Log In
          </a>
        )}
      </div>
    </>
  );
}
