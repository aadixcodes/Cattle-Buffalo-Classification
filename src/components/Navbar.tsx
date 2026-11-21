import { NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Brain, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/classify', label: 'Classify' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/model-performance', label: 'Performance' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-black/[0.06] bg-cream/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Brain className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-[17px] font-700 tracking-tight text-brand-900">
            CattleBuffalo<span className="text-brand-500"> AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-600 transition-colors ${
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-brand-700/80 hover:bg-brand-50 hover:text-brand-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-800 hover:bg-brand-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/[0.06] bg-cream md:hidden">
          <div className="container-page flex flex-col py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-600 ${
                    isActive ? 'bg-brand-100 text-brand-800' : 'text-brand-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
