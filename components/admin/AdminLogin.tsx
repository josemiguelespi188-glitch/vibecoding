import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginAdmin, ADMIN_PREFILL } from '../../lib/adminAuth';
import { Button, Input, T } from '../UIElements';

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onSuccess, onBack }) => {
  const [email,    setEmail]    = useState(ADMIN_PREFILL.email);
  const [password, setPassword] = useState(ADMIN_PREFILL.password);
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Small artificial delay so the UI doesn't flash
    await new Promise((r) => setTimeout(r, 600));
    if (loginAdmin(email, password)) {
      onSuccess();
    } else {
      setError('Invalid administrator credentials.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: T.bg }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${T.border}50 1px, transparent 1px), linear-gradient(90deg, ${T.border}50 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rotate-45 rounded-sm" style={{ background: T.gold }} />
            <div className="absolute inset-[5px] rotate-45 rounded-sm" style={{ background: T.bg }} />
          </div>
          <span className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: T.text }}>
            Axis Admin
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-md overflow-hidden"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          {/* Header */}
          <div
            className="px-8 py-5 flex items-center gap-3"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ background: T.goldFaint, border: `1px solid ${T.gold}30` }}
            >
              <Lock size={14} style={{ color: T.gold }} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: T.text }}>
                Administrator Access
              </p>
              <p className="text-[9px]" style={{ color: T.textDim }}>Restricted — authorized personnel only</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@axisplatform.com"
              required
              autoComplete="username"
            />

            <div className="space-y-1.5">
              <label
                className="block text-[10px] font-bold uppercase tracking-widest"
                style={{ color: T.textSub }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    background: T.raised,
                    border: `1px solid ${error ? T.ruby : T.border}`,
                    color: T.text,
                  }}
                  className="w-full rounded-sm px-4 pr-11 py-2.5 text-sm outline-none transition-all focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/10 placeholder:text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: T.textDim }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-xs"
                style={{ background: T.rubyFaint, border: `1px solid ${T.ruby}30`, color: T.ruby }}
              >
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 rounded-full border-black/30 border-t-black animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <Lock size={12} />
                  Sign In to Admin Portal
                </>
              )}
            </Button>
          </form>
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full text-center text-[10px] font-bold uppercase tracking-widest transition-colors hover:opacity-80"
          style={{ color: T.textDim }}
        >
          ← Back to Platform
        </button>
      </div>
    </div>
  );
};
