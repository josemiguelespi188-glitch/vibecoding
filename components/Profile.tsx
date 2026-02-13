
import React, { useState } from 'react';
import { Card, Badge, Button } from './UIElements';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Briefcase, 
  Users, 
  Landmark, 
  Plus, 
  Settings, 
  LogOut, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
/* Added InvestmentAccount to imports to correctly type the new account object */
import { InvestmentAccountType, DocumentStatus, User as UserType, InvestmentAccount } from '../types';
import { MOCK_ACCOUNTS } from '../constants';

interface ProfileProps {
  user: UserType;
  onLogout: () => void;
  onNavigateToAccreditation: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onNavigateToAccreditation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);

  // Global verification mock states (synchronized with Accreditation logic)
  const globalIdVerified = true;
  const globalAccreditationVerified = false; // "Under Review" in our mock

  const getAccountStatus = (acc: any) => {
    // Individual inherits everything, others might need specific docs
    const needsSpecificDoc = acc.type === InvestmentAccountType.CORPORATION || acc.type === InvestmentAccountType.IRA;
    
    if (globalIdVerified && globalAccreditationVerified && !needsSpecificDoc) {
      return { label: 'Fully Verified', variant: 'success' as const };
    }
    
    if (needsSpecificDoc) {
      return { label: 'Pending Documents', variant: 'warning' as const };
    }
    
    return { label: 'Partially Verified', variant: 'info' as const };
  };

  const toggleAccount = (id: string) => {
    setExpandedAccount(expandedAccount === id ? null : id);
  };

  const handleCreateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as InvestmentAccountType;
    const displayName = formData.get('displayName') as string;
    
    /* Added user_id and created_at to resolve Type assignment errors in setAccounts */
    const newAccount: InvestmentAccount = {
      id: 'acc_' + Math.random().toString(36).substr(2, 5),
      user_id: user.id,
      type,
      display_name: displayName,
      created_at: new Date().toISOString()
    };
    
    setAccounts([...accounts, newAccount]);
    setShowAddAccountModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Investor Profile</h1>
        <p className="text-[#8FAEDB] text-sm uppercase tracking-widest font-medium opacity-60">Personal Information & Legal Entities</p>
      </header>

      {/* 1. Profile Information */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#2F80ED]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Profile Information</h2>
          </div>
          <Button variant="outline" className="text-[10px] py-1.5 px-4" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <Card className="bg-[#0F2A4A]/30 border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <InfoItem icon={User} label="Full Legal Name" value={user.full_name} isEditing={isEditing} />
            <InfoItem icon={Mail} label="Email Address" value={user.email} isEditing={false} />
            <InfoItem icon={Phone} label="Phone Number" value="+1 (555) 000-0000" isEditing={isEditing} />
            <InfoItem icon={Globe} label="Country of Residence" value="United States" isEditing={isEditing} />
            <InfoItem icon={Calendar} label="Date of Birth" value="Jan 12, 1980" isEditing={isEditing} />
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#8FAEDB]">Global Accreditation Status</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="info">Under Review</Badge>
                <span className="text-[8px] text-[#8FAEDB] italic uppercase opacity-50">Expires Oct 2025</span>
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
              <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
            </div>
          )}
        </Card>
      </section>

      {/* 2. Your Accounts Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Landmark size={18} className="text-[#00E0C6]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Your Investment Accounts</h2>
          </div>
          <Badge variant="success">{accounts.length} Active Ledgers</Badge>
        </div>

        <div className="space-y-3">
          {accounts.map((acc) => {
            const status = getAccountStatus(acc);
            const isExpanded = expandedAccount === acc.id;
            
            return (
              <div key={acc.id} className="space-y-2">
                <button 
                  onClick={() => toggleAccount(acc.id)}
                  className={`w-full text-left glass-panel p-5 rounded-xl border transition-all flex items-center justify-between group ${
                    isExpanded ? 'border-[#2F80ED]/40 bg-[#2F80ED]/5' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isExpanded ? 'bg-[#2F80ED]/20 text-[#2F80ED]' : 'bg-white/5 text-[#8FAEDB] group-hover:text-white'
                    }`}>
                      {acc.type === InvestmentAccountType.INDIVIDUAL && <User size={20} />}
                      {acc.type === InvestmentAccountType.CORPORATION && <Briefcase size={20} />}
                      {acc.type === InvestmentAccountType.JOINT && <Users size={20} />}
                      {acc.type === InvestmentAccountType.IRA && <Landmark size={20} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">{acc.display_name}</h3>
                      <span className="text-[9px] text-[#8FAEDB] uppercase tracking-widest font-bold opacity-60">{acc.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <ChevronDown size={18} className={`text-[#8FAEDB] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mx-4 p-6 bg-[#0F2A4A]/20 border-x border-b border-white/5 rounded-b-xl animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#00E0C6]" />
                          Compliance Status
                        </h4>
                        <div className="space-y-2">
                          <StatusRow label="Identity Verification" status={DocumentStatus.VERIFIED} />
                          <StatusRow label="Accreditation Proof" status={DocumentStatus.UNDER_REVIEW} />
                          {acc.type === InvestmentAccountType.CORPORATION && (
                            <StatusRow label="Articles of Incorporation" status={DocumentStatus.NOT_UPLOADED} />
                          )}
                          {acc.type === InvestmentAccountType.IRA && (
                            <StatusRow label="Custodian Confirmation" status={DocumentStatus.NOT_UPLOADED} />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-3">
                        <p className="text-[10px] text-[#8FAEDB] leading-relaxed italic">
                          New accounts automatically inherit your verified Global Identity and Accreditation documents. Additional entity-specific documentation may be required.
                        </p>
                        <Button onClick={onNavigateToAccreditation} variant="outline" className="text-[9px] w-full flex items-center justify-center gap-2">
                          <FileText size={14} />
                          Complete Accreditation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setShowAddAccountModal(true)}
          className="w-full py-4 border border-dashed border-white/10 rounded-xl text-[#8FAEDB] hover:text-white hover:border-[#2F80ED]/50 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus size={18} className="group-hover:text-[#2F80ED]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add New Investment Account</span>
        </button>
      </section>

      {/* 3. Settings & Sign Out Relocation */}
      <section className="pt-12 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
               <Settings size={16} className="text-[#8FAEDB]" />
               <h2 className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Account Settings</h2>
             </div>
             <div className="flex flex-wrap gap-4">
               <button className="text-[11px] text-[#8FAEDB] hover:text-white uppercase tracking-widest font-bold flex items-center gap-2 border-b border-transparent hover:border-white/20 pb-1 transition-all">Two-Factor Auth</button>
               <button className="text-[11px] text-[#8FAEDB] hover:text-white uppercase tracking-widest font-bold flex items-center gap-2 border-b border-transparent hover:border-white/20 pb-1 transition-all">Notification Prefs</button>
               <button className="text-[11px] text-[#8FAEDB] hover:text-white uppercase tracking-widest font-bold flex items-center gap-2 border-b border-transparent hover:border-white/20 pb-1 transition-all">Privacy Controls</button>
             </div>
          </div>

          <div className="flex justify-end items-end">
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-red-500/10 text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <LogOut size={16} />
              Terminar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081C3A]/90 backdrop-blur-md" onClick={() => setShowAddAccountModal(false)}></div>
          <Card className="relative w-full max-w-lg p-0 overflow-hidden border-[#2F80ED]/20 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0F2A4A]/50">
               <h2 className="text-lg font-bold text-white tracking-tight uppercase">Create New Investment Account</h2>
               <button onClick={() => setShowAddAccountModal(false)} className="text-[#8FAEDB] hover:text-white transition-colors">
                  <X size={20} />
               </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-8 space-y-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8FAEDB]">Account Type</label>
                  <select name="type" required className="w-full bg-[#081C3A] border border-white/10 rounded px-4 py-3 text-white focus:border-[#2F80ED] outline-none">
                    {Object.values(InvestmentAccountType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8FAEDB]">Display Name</label>
                  <input name="displayName" required type="text" className="w-full bg-[#081C3A] border border-white/10 rounded px-4 py-3 text-white" placeholder="e.g. My Family Trust" />
               </div>
               <div className="p-4 bg-white/5 border border-white/5 rounded text-[10px] text-[#8FAEDB] leading-relaxed italic">
                 Note: New accounts will inherit your global identity verification and accreditation status. 
                 Additional documentation (Entity papers, Custodian letters) may be requested in the next step.
               </div>
               <Button type="submit" className="w-full py-4 uppercase tracking-widest text-sm">Initialize Account Ledger</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{ icon: any, label: string, value: string, isEditing: boolean }> = ({ icon: Icon, label, value, isEditing }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] uppercase tracking-widest font-bold text-[#8FAEDB] flex items-center gap-2">
      <Icon size={12} className="opacity-60" />
      {label}
    </label>
    {isEditing ? (
      <input type="text" defaultValue={value} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#2F80ED] outline-none" />
    ) : (
      <div className="text-sm font-bold text-white tracking-tight">{value}</div>
    )}
  </div>
);

const StatusRow: React.FC<{ label: string, status: DocumentStatus }> = ({ label, status }) => {
  const isVerified = status === DocumentStatus.VERIFIED;
  const isPending = status === DocumentStatus.UNDER_REVIEW;
  
  return (
    <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
      <div className="flex items-center gap-2">
        {isVerified ? (
          <CheckCircle2 size={12} className="text-[#00E0C6]" />
        ) : isPending ? (
          <Clock size={12} className="text-yellow-500" />
        ) : (
          <AlertCircle size={12} className="text-red-500" />
        )}
        <span className="text-[10px] text-[#8FAEDB] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <span className={`text-[8px] uppercase tracking-widest font-bold ${
        isVerified ? 'text-[#00E0C6]' : isPending ? 'text-yellow-500' : 'text-red-400'
      }`}>
        {status}
      </span>
    </div>
  );
};

const Clock: React.FC<{ size?: number, className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
