
import React, { useState, useMemo } from 'react';
import { Deal, InvestmentAccountType, RequestStatus, DocumentStatus, InvestmentAccount } from '../types';
import { Card, Button, Badge } from './UIElements';
import { X, CheckCircle2, ChevronRight, ChevronDown, Landmark, FileText, CreditCard, Shield, AlertTriangle, Building2, Copy, Info, AlertCircle, FileUp } from 'lucide-react';
import { REQUIRED_DOCS_BY_ACCOUNT_TYPE } from './Accreditation';

interface InvestmentModalProps {
  deal: Deal;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onComplete?: () => void;
  userFullName?: string;
  accounts: InvestmentAccount[];
  uploadedDocNames: Set<string>;
  onUploadDoc: (docName: string) => void;
}

type FundingMethod = 'WIRE' | 'ACH' | 'CC' | 'IRA';

export const InvestmentModal: React.FC<InvestmentModalProps> = ({ deal, onClose, onSubmit, onComplete, userFullName = "Alexander Vanderbilt", accounts, uploadedDocNames, onUploadDoc }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(deal.minimum_investment);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [fundingMethod, setFundingMethod] = useState<FundingMethod | null>(null);
  const [iraAcknowledged, setIraAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Resolution flow state
  const [resolvingDoc, setResolvingDoc] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const getMissingDocs = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return [];
    const required = REQUIRED_DOCS_BY_ACCOUNT_TYPE[acc.type] || ['Accreditation Letter'];
    // Government ID is always required globally
    const allRequired = [...required, 'Government ID'];
    return allRequired.filter(doc => !uploadedDocNames.has(doc));
  };

  const isAccountReady = (accountId: string) => {
    return getMissingDocs(accountId).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !isAccountReady(selectedAccountId)) {
      return; // UI handles blocking
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleResolveUpload = async (docName: string) => {
    setIsResolving(true);
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 1200));
    onUploadDoc(docName);
    setIsResolving(false);
    setResolvingDoc(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    onSubmit({ 
      dealId: deal.id, 
      dealName: deal.title,
      amount, 
      accountId: selectedAccountId,
      status: RequestStatus.UNDER_REVIEW
    });
    setStep(5);
    setIsSubmitting(false);
  };

  const steps = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Allocation' },
    { id: 3, label: 'Disclosure' },
    { id: 4, label: 'Funding' },
    { id: 5, label: 'Confirmation' },
  ];

  const canConfirmFunding = fundingMethod && (fundingMethod !== 'IRA' || iraAcknowledged) && !isSubmitting;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#081C3A]/95 backdrop-blur-md" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-[#2F80ED]/20 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0F2A4A]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#2F80ED]/10 flex items-center justify-center text-[#2F80ED] border border-[#2F80ED]/20">
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase">Capital Allocation</h2>
              <p className="text-xs text-[#8FAEDB]">{deal.title} • <span className="text-[#2F80ED]">{deal.strategy}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8FAEDB] hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-white/5 shrink-0">
          {steps.map((s) => (
            <div key={s.id} className="flex-1 h-1 relative">
              <div className={`absolute inset-0 transition-all duration-500 ${step >= s.id ? 'bg-[#2F80ED] cyan-glow' : 'bg-white/5'}`}></div>
            </div>
          ))}
        </div>

        <div className="p-8 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <label className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Step 1: Select Investing Account</label>
              <div className="grid grid-cols-1 gap-3">
                {accounts.map(acc => {
                  const ready = isAccountReady(acc.id);
                  const missing = getMissingDocs(acc.id);
                  const isSelected = selectedAccountId === acc.id;

                  return (
                    <div key={acc.id} className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`p-5 rounded-lg border text-left transition-all relative group ${
                          isSelected 
                            ? (ready ? 'border-[#2F80ED] bg-[#2F80ED]/5 ring-1 ring-[#2F80ED]/50' : 'border-yellow-500/50 bg-yellow-500/5 ring-1 ring-yellow-500/30') 
                            : 'border-white/5 bg-white/5 text-[#8FAEDB] hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className={`font-bold uppercase tracking-wider block ${isSelected ? 'text-white' : 'text-[#8FAEDB]'}`}>{acc.display_name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-[#8FAEDB] uppercase tracking-widest">Type: {acc.type}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {ready ? (
                              <Badge variant="success">Ready to Invest</Badge>
                            ) : (
                              <Badge variant="warning">Missing Documents</Badge>
                            )}
                          </div>
                        </div>
                      </button>

                      {isSelected && !ready && (
                        <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg animate-in slide-in-from-top-2 duration-300">
                           <div className="flex items-start gap-3 mb-4">
                              <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                              <div className="space-y-1">
                                 <p className="text-xs font-bold text-white uppercase tracking-tight">Compliance Blocking</p>
                                 <p className="text-[10px] text-[#8FAEDB] uppercase tracking-wider leading-relaxed">
                                    Your selected account requires additional documentation before capital can be allocated.
                                 </p>
                              </div>
                           </div>
                           <div className="space-y-2">
                              {missing.map(doc => (
                                 <div key={doc} className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                                    <div className="flex items-center gap-2">
                                       <FileText size={14} className="text-[#8FAEDB]" />
                                       <span className="text-[10px] text-[#8FAEDB] uppercase font-bold tracking-widest">{doc}</span>
                                    </div>
                                    <button 
                                      onClick={() => setResolvingDoc(doc)}
                                      className="text-[10px] text-[#2F80ED] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                      <FileUp size={12} />
                                      Resolve Now
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button 
                onClick={handleNext} 
                disabled={!isAccountReady(selectedAccountId)}
                className="w-full py-4 text-sm"
              >
                Proceed to Allocation Amount <ChevronRight size={16} className="inline ml-1"/>
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Step 2: Enter Allocation Amount</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2F80ED] font-bold text-3xl">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#081C3A] border border-white/10 rounded-lg py-6 pl-12 pr-6 text-4xl font-bold text-white outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-[#8FAEDB] tracking-widest font-bold block">Est. Annual Yield</span>
                    <span className="text-xl font-bold text-[#00E0C6]">${(amount * (deal.cash_yield / 100)).toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-[#8FAEDB] tracking-widest font-bold block">Target IRR</span>
                    <span className="text-xl font-bold text-[#2F80ED]">{deal.projected_irr}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" onClick={handleBack} className="py-4">Back</Button>
                <Button onClick={handleNext} disabled={amount < deal.minimum_investment} className="py-4">Review Documents</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <label className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Step 3: Subscription Agreement</label>
              <div className="p-6 rounded-lg bg-white/5 border border-white/10 space-y-4">
                 <div className="flex items-center gap-3 text-white">
                    <FileText size={24} className="text-[#2F80ED]" />
                    <span className="font-bold uppercase tracking-wider text-sm">SubscriptionAgreement_V2.pdf</span>
                 </div>
                 <div className="h-40 bg-black/40 rounded border border-white/5 flex items-center justify-center p-4">
                    <p className="text-[10px] text-[#8FAEDB]/50 uppercase tracking-widest text-center leading-relaxed">
                      E-Sign required to proceed.
                    </p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleBack} className="py-4">Back</Button>
                <Button onClick={handleNext} className="py-4">Sign & Proceed</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <label className="text-[10px] font-bold text-[#8FAEDB] uppercase tracking-[0.2em]">Step 4: Funding Method</label>
              <div className="grid grid-cols-1 gap-4">
                {['WIRE', 'ACH', 'CC', 'IRA'].map((m) => (
                  <button 
                    key={m}
                    onClick={() => setFundingMethod(m as FundingMethod)}
                    className={`flex items-center justify-between p-5 border rounded-xl transition-all ${fundingMethod === m ? 'border-[#2F80ED] bg-[#2F80ED]/5' : 'border-white/10 hover:bg-white/5'}`}
                  >
                     <div className="flex items-center gap-4">
                        <Building2 className={fundingMethod === m ? 'text-[#2F80ED]' : 'text-[#8FAEDB]'} />
                        <span className="block text-sm font-bold text-white uppercase tracking-wider">{m}</span>
                     </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 shrink-0">
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="py-4">Back</Button>
                <Button onClick={handleSubmit} disabled={!fundingMethod || isSubmitting} className="py-4">Confirm Funding</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-[#00E0C6]/10 flex items-center justify-center text-[#00E0C6] border border-[#00E0C6]/20">
                  <Shield size={48} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-2">Allocation Submitted</h2>
                <p className="text-[#8FAEDB] text-sm max-w-sm mx-auto leading-relaxed">
                  Your request is now in committee review.
                </p>
              </div>
              <Button onClick={onComplete || onClose} variant="primary" className="w-full py-4 text-sm">Return to Command Center</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Inline Resolution Modal */}
      {resolvingDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#081C3A]/90 backdrop-blur-md" onClick={() => !isResolving && setResolvingDoc(null)}></div>
           <Card className="relative w-full max-w-sm p-8 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 rounded-full bg-[#2F80ED]/10 flex items-center justify-center text-[#2F80ED] mx-auto border border-[#2F80ED]/20">
                    <FileUp size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-white uppercase tracking-tight">Resolve {resolvingDoc}</h3>
                 <p className="text-[10px] text-[#8FAEDB] uppercase tracking-widest leading-relaxed">Required for the selected ledger</p>
              </div>
              
              <div className="p-4 rounded bg-white/5 border border-white/10 text-center">
                 <p className="text-xs text-white font-bold mb-1">Upload AXIS_COMPLIANCE_FORM.pdf</p>
                 <p className="text-[8px] text-[#8FAEDB]/50 uppercase tracking-widest italic">Simulated institutional file selection active</p>
              </div>

              <div className="flex flex-col gap-3">
                 <Button 
                   onClick={() => handleResolveUpload(resolvingDoc)}
                   disabled={isResolving}
                   className="w-full py-4 flex items-center justify-center gap-2"
                 >
                    {isResolving ? (
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Confirm Upload'}
                 </Button>
                 <button onClick={() => setResolvingDoc(null)} disabled={isResolving} className="text-[10px] text-[#8FAEDB] uppercase tracking-widest font-bold">Cancel</button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};
