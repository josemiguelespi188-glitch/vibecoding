import React, { useState, useEffect } from 'react';
import { Button, T } from './UIElements';

type LandingTab = 'invest' | 'raise';

export const Navbar: React.FC<{
  onAccess: () => void;
  activeTab?: LandingTab;
  onTabChange?: (tab: LandingTab) => void;
}> = ({ onAccess, activeTab, onTabChange }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? `${T.surface}F0` : 'transparent',
        borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rotate-45 rounded-sm" style={{ background: T.gold }} />
            <div className="absolute inset-1.5 rotate-45 rounded-sm" style={{ background: T.bg }} />
          </div>
          <span className="text-base font-black tracking-[0.15em] uppercase" style={{ color: T.text }}>
            Diversify
          </span>
        </div>

        {/* Tab Switcher (center) — shown when tabs are active */}
        {activeTab && onTabChange ? (
          <div
            className="hidden md:flex items-center rounded-sm p-0.5"
            style={{ background: T.raised, border: `1px solid ${T.border}` }}
          >
            {(['invest', 'raise'] as LandingTab[]).map((id) => {
              const label = id === 'invest' ? 'Invest With Us' : 'Raise Capital';
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className="px-5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-200"
                  style={{ background: active ? T.gold : 'transparent', color: active ? '#000' : T.textSub }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-8">
            {['Philosophy', 'Portfolio', 'Sponsors'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 hover:text-amber-400"
                style={{ color: T.textSub }}
              >
                {item}
              </a>
            ))}
          </div>
        )}

        <Button onClick={onAccess} size="sm">
          Access Platform
        </Button>
      </div>

      {/* Mobile Tab Switcher */}
      {activeTab && onTabChange && (
        <div className="md:hidden flex" style={{ borderTop: `1px solid ${T.border}` }}>
          {(['invest', 'raise'] as LandingTab[]).map((id) => {
            const label = id === 'invest' ? 'Invest With Us' : 'Raise Capital';
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: active ? T.goldFaint : 'transparent',
                  color: active ? T.gold : T.textDim,
                  borderBottom: active ? `2px solid ${T.gold}` : '2px solid transparent',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
