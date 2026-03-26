import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Home, Scale, Salad, Dumbbell, Bot, TrendingUp, User, Brain, LogOut, Video } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', href: '#hero' },
  { icon: Scale, label: 'Calculate', href: '#bmi' },
  { icon: Salad, label: 'Diet', href: '#diet' },
  { icon: Video, label: 'Form AI', href: '#form-analysis' },
  { icon: Dumbbell, label: 'Workout', href: '#workout' },
  { icon: Bot, label: 'Coach', href: '#chat' },
  { icon: TrendingUp, label: 'Progress', href: '#progress' },
];

export default function SideNav() {
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);
  const { isAuthenticated, userName, setShowAuthModal, logout } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth <= 900) return;
      if (e.clientX < 60) setExpanded(true);
      else if (e.clientX > 280) setExpanded(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollTo = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      className="fixed left-0 top-0 h-screen z-[1000] flex flex-col items-center py-5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-r border-white/[0.08] hidden md:flex"
      style={{
        width: expanded ? '240px' : '70px',
        background: 'rgba(10, 15, 10, 0.92)',
        backdropFilter: 'blur(25px)',
      }}
    >
      <div className="w-full h-full flex flex-col justify-between items-center px-2.5">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => scrollTo(e, '#hero')}
          className="flex items-center gap-2.5 no-underline cursor-pointer whitespace-nowrap px-2.5 py-2 mb-2.5"
        >
          <div className="w-[38px] h-[38px] min-w-[38px] rounded-[10px] flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-sage to-forest-bright">
            F
          </div>
          <span
            className="font-[var(--font-display)] text-[1.2rem] font-bold bg-gradient-to-br from-sage-light to-gold-light bg-clip-text text-transparent transition-opacity duration-300"
            style={{ opacity: expanded ? 1 : 0 }}
          >
            FITMIND
          </span>
        </a>

        {/* Nav Links */}
        <ul className="flex flex-col gap-1 list-none w-full flex-1 pt-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="w-full">
                <a
                  href={item.href}
                  onClick={(e) => scrollTo(e, item.href)}
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-cream/80 text-sm font-medium no-underline transition-all duration-300 hover:text-cream hover:bg-sage/15 cursor-pointer whitespace-nowrap overflow-hidden"
                >
                  <Icon className="w-5 h-5 min-w-[24px] flex-shrink-0" />
                  <span
                    className="transition-opacity duration-300"
                    style={{ opacity: expanded ? 1 : 0 }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Bottom Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {/* User button */}
          <button
            onClick={() => !isAuthenticated && setShowAuthModal(true)}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-white text-sm font-medium cursor-pointer transition-all duration-400 w-full bg-gradient-to-br from-forest-light to-sage border-0 relative overflow-hidden"
          >
            <span className="relative flex-shrink-0">
              <User className="w-5 h-5" />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-forest-light ${isAuthenticated ? 'bg-green-400 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}
              />
            </span>
            <span
              className="relative z-[1] transition-opacity duration-300 flex-1 text-left truncate"
              style={{ opacity: expanded ? 1 : 0 }}
            >
              {isAuthenticated ? userName : 'Log In'}
            </span>
          </button>

          {/* Logout — only visible when authenticated */}
          {isAuthenticated && (
            <button
              onClick={logout}
              title="Log Out"
              className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-red-400 text-sm font-medium cursor-pointer transition-all duration-400 w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 overflow-hidden"
            >
              <LogOut className="w-5 h-5 min-w-[24px] flex-shrink-0" />
              <span
                className="transition-opacity duration-300 whitespace-nowrap"
                style={{ opacity: expanded ? 1 : 0 }}
              >
                Log Out
              </span>
            </button>
          )}

          <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-white/60 text-sm w-full bg-white/5 border border-white/[0.08]">
            <Brain className="w-5 h-5 min-w-[24px] flex-shrink-0" />
            <span
              className="text-[0.7rem] transition-opacity duration-300 whitespace-nowrap"
              style={{ opacity: expanded ? 1 : 0 }}
            >
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
