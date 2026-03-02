import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Portfolio } from './components/Portfolio';
import { InvestmentModal } from './components/InvestmentModal';
import { Accreditation } from './components/Accreditation';
import { Accounts } from './components/Accounts';
import { ProfilePanel } from './components/ProfilePanel';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Distributions } from './components/Distributions';
import { Documents } from './components/Documents';
import { Support } from './components/Support';
import { Button, T } from './components/UIElements';
import { AdminLogin } from './components/AdminLogin';
import { AdminPortal } from './components/AdminPortal';
import { LandingPage } from './components/LandingPage';
import { getAdminSession, AdminSession } from './lib/adminAuth';
import { Deal, User, InvestmentRequest, InvestmentAccount, InvestmentAccountType, DealSubmission } from './types';
import { MOCK_ACCOUNTS } from './constants';

type AppState = 'LANDING' | 'AUTH' | 'ONBOARDING' | 'PORTAL' | 'ADMIN_LOGIN' | 'ADMIN_PORTAL';

// ─── Portal Shell ─────────────────────────────────────────────────────────────

const SettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center p-16 rounded-md max-w-md" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-6" style={{ background: T.raised, border: `1px solid ${T.border}` }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>
      <h2 className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: T.text }}>Settings</h2>
      <p className="text-xs mb-8" style={{ color: T.textSub }}>Account settings infrastructure coming soon.</p>
      <Button onClick={onBack} variant="outline">Return to Dashboard</Button>
    </div>
  </div>
);

const Portal: React.FC<{ user: User; onLogout: () => void; onUpdateUser: (data: Partial<User>) => void }> = ({ user, onLogout, onUpdateUser }) => {
  const [currentView, setView] = useState('dashboard');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [accounts, setAccounts] = useState<InvestmentAccount[]>(MOCK_ACCOUNTS);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleInvestmentSubmit = (data: { dealId: string; dealName: string; accountId: string; amount: number; status: string }) => {
    const newRequest: InvestmentRequest = {
      id: 'REQ_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      user_id: user.id,
      deal_id: data.dealId,
      deal_name: data.dealName,
      account_id: data.accountId,
      amount: data.amount,
      status: data.status,
      created_at: new Date().toISOString(),
    };
    setRequests([newRequest, ...requests]);
  };

  const handleAddAccount = (data: Partial<InvestmentAccount>) => {
    const newAccount: InvestmentAccount = {
      id: 'ACC_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      user_id: user.id,
      type: data.type || InvestmentAccountType.INDIVIDUAL,
      display_name: data.display_name || 'New Ledger',
      created_at: new Date().toISOString(),
      ...data,
    };
    setAccounts([...accounts, newAccount]);
  };

  const isAccredited = user.accreditation_status === 'Verified';

  return (
    <div className="min-h-screen flex" style={{ background: T.bg }}>
      <Sidebar user={user} currentView={currentView} setView={setView} onLogout={onLogout} onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-1 ml-56 p-8 overflow-y-auto min-h-screen">
        {currentView === 'dashboard'      && <Dashboard onAllocate={setSelectedDeal} onViewPortfolio={() => setView('portfolio')} requests={requests} isAccredited={isAccredited} />}
        {currentView === 'portfolio'      && <Portfolio onAllocate={setSelectedDeal} isAccredited={isAccredited} />}
        {currentView === 'accounts'       && <Accounts user={user} accounts={accounts} onAddAccount={handleAddAccount} onNavigateToAccreditation={() => setView('accreditation')} />}
        {currentView === 'accreditation'  && <Accreditation user={user} accounts={accounts} />}
        {currentView === 'distributions'  && <Distributions />}
        {currentView === 'documents'      && <Documents />}
        {currentView === 'support'        && <Support userName={user.full_name} accounts={accounts} />}
        {currentView === 'settings'       && <SettingsView onBack={() => setView('dashboard')} />}
      </main>

      {selectedDeal && (
        <InvestmentModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onSubmit={handleInvestmentSubmit}
          onComplete={() => { setSelectedDeal(null); setView('dashboard'); }}
          userFullName={user.full_name}
        />
      )}

      <ProfilePanel user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onUpdate={onUpdateUser} />

      {/* Support FAB */}
      <button
        onClick={() => setView('support')}
        title="Support"
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-sm flex items-center justify-center transition-all hover:scale-105"
        style={{ background: T.gold, color: '#000', boxShadow: `0 0 20px ${T.gold}40` }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [user, setUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [dealSubmissions, setDealSubmissions] = useState<DealSubmission[]>([]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [appState]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setAppState(userData.onboarded ? 'PORTAL' : 'ONBOARDING');
  };

  const handleAdminLoginSuccess = () => {
    const s = getAdminSession();
    setAdminSession(s);
    setAppState('ADMIN_PORTAL');
  };

  if (appState === 'LANDING')    return <LandingPage onStart={() => setAppState('AUTH')} onAdminAccess={() => setAppState('ADMIN_LOGIN')} onSubmitDeal={(sub) => setDealSubmissions((prev) => [sub, ...prev])} />;
  if (appState === 'AUTH')       return <Auth onSuccess={handleLoginSuccess} onBack={() => setAppState('LANDING')} onAdminAccess={() => setAppState('ADMIN_LOGIN')} />;
  if (appState === 'ONBOARDING' && user) return <Onboarding user={user} onComplete={() => { setUser({ ...user, onboarded: true }); setAppState('PORTAL'); }} />;
  if (appState === 'PORTAL' && user)     return <Portal user={user} onLogout={() => { setUser(null); setAppState('LANDING'); }} onUpdateUser={(d) => setUser({ ...user!, ...d })} />;
  if (appState === 'ADMIN_LOGIN') return <AdminLogin onSuccess={handleAdminLoginSuccess} onBack={() => setAppState('LANDING')} />;
  if (appState === 'ADMIN_PORTAL' && adminSession) return <AdminPortal session={adminSession} onLogout={() => { setAdminSession(null); setAppState('LANDING'); }} submissions={dealSubmissions} />;
  return null;
};

export default App;
