
import React from 'react';

// Added type prop to support standard button behaviors (submit, button, reset) and resolve type errors when used in forms
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, variant = 'primary', className = '', onClick, disabled, type = 'submit' }) => {
  const base = 'px-6 py-2.5 rounded font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider';
  const variants = {
    primary: 'bg-[#2F80ED] text-white hover:bg-[#1457B6] cyan-glow shadow-lg shadow-[#2F80ED]/20',
    outline: 'border border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]/10',
    ghost: 'text-[#8FAEDB] hover:text-white hover:bg-white/5'
  };

  return (
    <button 
      type={type} 
      className={`${base} ${variants[variant]} ${className}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'info' | 'warning' }> = ({ children, variant = 'info' }) => {
  const variants = {
    success: 'bg-[#00E0C6]/10 text-[#00E0C6] border-[#00E0C6]/30',
    info: 'bg-[#2F80ED]/10 text-[#2F80ED] border-[#2F80ED]/30',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-panel p-6 rounded-xl ${className}`}>
    {children}
  </div>
);

export const SectionHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
    {subtitle && <p className="text-[#8FAEDB] text-lg max-w-2xl">{subtitle}</p>}
  </div>
);
