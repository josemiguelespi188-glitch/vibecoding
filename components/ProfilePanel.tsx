
import React, { useState } from 'react';
import { Card, Button, Badge } from './UIElements';
import { User as UserType } from '../types';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Settings,
  Shield
} from 'lucide-react';

interface ProfilePanelProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<UserType>) => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#081C3A]/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#0F2A4A] border-l border-white/10 shadow-2xl h-screen flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#081C3A]/50">
           <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">Investor Identity</h2>
              <p className="text-[10px] text-[#8FAEDB] uppercase tracking-widest font-bold opacity-60">Personal Legal Information</p>
           </div>
           <button onClick={onClose} className="text-[#8FAEDB] hover:text-white p-2">
              <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
           {/* Summary Section */}
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 flex items-center justify-center text-[#2F80ED] text-2xl font-bold shadow-lg shadow-[#2F80ED]/10">
                 {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white uppercase tracking-tight">{user.full_name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <Badge variant="success">Verified Identity</Badge>
                    <span className="text-[10px] text-[#8FAEDB] font-bold uppercase tracking-widest opacity-40">Since 2024</span>
                 </div>
              </div>
           </div>

           {/* Personal Details */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Contact & Identity</h4>
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="text-[10px] text-[#2F80ED] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  {isEditing ? 'Confirm Changes' : 'Update Details'}
                </button>
              </div>

              <div className="space-y-5">
                 <ProfileItem 
                   icon={User} 
                   label="Legal Name" 
                   value={formData.full_name} 
                   isEditing={isEditing}
                   onChange={val => setFormData({...formData, full_name: val})}
                 />
                 <ProfileItem 
                   icon={Mail} 
                   label="Institutional Email" 
                   value={formData.email} 
                   isEditing={false} // Email typically locked
                 />
                 <ProfileItem 
                   icon={Phone} 
                   label="Phone Number" 
                   value={formData.phone || '+1 (555) 000-0000'} 
                   isEditing={isEditing}
                   onChange={val => setFormData({...formData, phone: val})}
                 />
                 <ProfileItem 
                   icon={Globe} 
                   label="Tax Jurisdiction" 
                   value={formData.country || 'United States'} 
                   isEditing={isEditing}
                   onChange={val => setFormData({...formData, country: val})}
                 />
                 <ProfileItem 
                   icon={Calendar} 
                   label="Date of Birth" 
                   value={formData.dob || 'Jan 12, 1980'} 
                   isEditing={isEditing}
                   onChange={val => setFormData({...formData, dob: val})}
                 />
              </div>
           </div>

           {/* Security Status */}
           <div className="pt-6 space-y-4">
              <h4 className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Platform Security</h4>
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <Shield size={16} className="text-[#00E0C6]" />
                    <span className="block text-[10px] text-white font-bold uppercase tracking-widest">Two-Factor</span>
                    <span className="block text-[8px] text-[#00E0C6] font-bold uppercase">Active</span>
                 </div>
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <Lock size={16} className="text-[#2F80ED]" />
                    <span className="block text-[10px] text-white font-bold uppercase tracking-widest">Encryption</span>
                    <span className="block text-[8px] text-[#2F80ED] font-bold uppercase">AES-256</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 bg-[#081C3A]/50 border-t border-white/5">
           <Button variant="ghost" className="w-full justify-start gap-3 text-[#8FAEDB]">
              <Settings size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Account Settings</span>
           </Button>
        </div>
      </div>
    </div>
  );
};

const ProfileItem: React.FC<{ 
  icon: any, 
  label: string, 
  value: string, 
  isEditing: boolean,
  onChange?: (val: string) => void
}> = ({ icon: Icon, label, value, isEditing, onChange }) => (
  <div className="space-y-1.5 group">
    <label className="text-[9px] uppercase tracking-widest font-bold text-[#8FAEDB]/60 flex items-center gap-2">
      <Icon size={12} />
      {label}
    </label>
    {isEditing ? (
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange?.(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-xs text-white focus:border-[#2F80ED] outline-none"
      />
    ) : (
      <div className="text-sm font-bold text-white tracking-tight border-b border-white/5 pb-2 group-hover:border-[#2F80ED]/30 transition-colors">
        {value}
      </div>
    )}
  </div>
);
