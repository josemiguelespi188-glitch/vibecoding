import React from 'react';
import {
  LayoutDashboard, Users, Briefcase, MessageSquare,
  FileText, Settings, LogOut, ChevronRight,
} from 'lucide-react';
import { logoutAdmin } from '../../lib/adminAuth';
import { T } from '../UIElements';

export type AdminView = 'dashboard' | 'users' | 'deals' | 'messages' | 'documents' | 'settings';

interface NavItem {
  key: AdminView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { key: 'users',      label: 'Users',      icon: Users },
  { key: 'deals',      label: 'Deals',      icon: Briefcase },
  { key: 'messages',   label: 'Messages',   icon: MessageSquare },
  { key: 'documents',  label: 'Documents',  icon: FileText },
  { key: 'settings',   label: 'Settings',   icon: Settings },
];

interface Props {
  currentView: AdminView;
  onNavigate: (v: AdminView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<Props> = ({ currentView, onNavigate, onLogout, children }) => {
  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };

  return (
    <div className="min-h-screen flex" style={{ background: T.bg }}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="fixed top-0 left-0 h-screen w-56 flex flex-col z-20"
        style={{ background: T.surface, borderRight: `1px solid ${T.border}` }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div className="relative w-5 h-5 flex-shrink-0">
            <div className="absolute inset-0 rotate-45 rounded-sm" style={{ background: T.gold }} />
            <div className="absolute inset-[3px] rotate-45 rounded-sm" style={{ background: T.surface }} />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: T.text }}>
              Axis
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: T.gold }}>
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-0.5 px-3">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = currentView === key;
              return (
                <button
                  key={key}
                  onClick={() => onNavigate(key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-all"
                  style={{
                    background: active ? T.goldFaint : 'transparent',
                    border: `1px solid ${active ? `${T.gold}30` : 'transparent'}`,
                    color: active ? T.gold : T.textSub,
                  }}
                >
                  <Icon size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
                  {active && <ChevronRight size={10} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Admin info + logout */}
        <div
          className="px-4 py-4"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          <div className="mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
              Signed in as
            </p>
            <p className="text-[10px] font-bold truncate mt-0.5" style={{ color: T.textSub }}>
              admin@axisplatform.com
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
            style={{ background: T.rubyFaint, border: `1px solid ${T.ruby}20`, color: T.ruby }}
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-1 ml-56 min-h-screen flex flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
          style={{ background: `${T.bg}ee`, borderBottom: `1px solid ${T.border}`, backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4" style={{ background: T.gold }} />
            <h1 className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: T.textSub }}>
              {NAV_ITEMS.find((n) => n.key === currentView)?.label ?? 'Admin Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest"
              style={{ background: T.goldFaint, border: `1px solid ${T.gold}30`, color: T.gold }}
            >
              Admin
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
