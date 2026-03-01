import React, { useState, useMemo } from 'react';
import { Search, Plus, X, ArrowLeft, ExternalLink, Edit3 } from 'lucide-react';
import {
  ADMIN_DEALS, ADMIN_INVESTMENTS, AdminDeal, AdminInvestment, dealStats, fmt$$,
} from '../../lib/adminData';
import { T, Badge, Button, Input, Table, TableRow, TableCell, SectionHeading, EmptyState } from '../UIElements';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_VARIANT: Record<string, 'jade' | 'gold' | 'neutral'> = {
  open: 'gold', funded: 'jade', closed: 'neutral',
};

// ─── Deal Form (create / edit) ────────────────────────────────────────────────

interface DealFormProps {
  initial?: AdminDeal;
  onSave: (d: AdminDeal) => void;
  onClose: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ initial, onSave, onClose }) => {
  const blank: AdminDeal = {
    id: `d-new-${Date.now()}`,
    name: '', slug: '', status: 'open', min_investment: 25000, currency: 'USD',
    thumbnail_url: '', youtube_url: '',
    short_description: '', long_description: '',
    admin_fee_percent: 1.5, profit_share_percent: 20,
    created_at: new Date().toISOString(),
  };
  const [form, setForm] = useState<AdminDeal>(initial ?? blank);

  const set = (k: keyof AdminDeal, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const valid = form.name && form.slug && form.short_description;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(7,8,12,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-md my-8"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-center justify-between px-7 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textSub }}>
            {initial ? 'Edit Deal' : 'New Deal'}
          </p>
          <button onClick={onClose} style={{ color: T.textDim }}>✕</button>
        </div>

        <div className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deal Name"
              value={form.name}
              onChange={(e) => { set('name', e.target.value); if (!initial) set('slug', e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')); }}
            />
            <Input label="Slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
                className="w-full rounded-sm px-4 py-2.5 text-sm outline-none"
              >
                <option value="open">Open</option>
                <option value="funded">Funded</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <Input label="Min Investment ($)" type="number" value={form.min_investment} onChange={(e) => set('min_investment', Number(e.target.value))} />
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Currency</label>
              <select value={form.currency} onChange={(e) => set('currency', e.target.value)} style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }} className="w-full rounded-sm px-4 py-2.5 text-sm outline-none">
                <option>USD</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Admin Fee (%)" type="number" step="0.25" value={form.admin_fee_percent} onChange={(e) => set('admin_fee_percent', Number(e.target.value))} />
            <Input label="Profit Share (%)" type="number" step="1" value={form.profit_share_percent} onChange={(e) => set('profit_share_percent', Number(e.target.value))} />
          </div>

          <Input label="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)} placeholder="https://…" />
          <Input label="YouTube URL (optional)" value={form.youtube_url ?? ''} onChange={(e) => set('youtube_url', e.target.value)} placeholder="https://youtube.com/watch?v=…" />

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Short Description</label>
            <textarea
              value={form.short_description}
              onChange={(e) => set('short_description', e.target.value)}
              rows={2}
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full rounded-sm px-4 py-2.5 text-sm outline-none resize-none focus:border-amber-500/60 placeholder:text-slate-700"
              placeholder="One-line deal summary…"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Long Description</label>
            <textarea
              value={form.long_description}
              onChange={(e) => set('long_description', e.target.value)}
              rows={5}
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full rounded-sm px-4 py-2.5 text-sm outline-none resize-none focus:border-amber-500/60 placeholder:text-slate-700"
              placeholder="Full deal description, underwriting thesis, key terms…"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => onSave(form)} disabled={!valid}>
              {initial ? 'Save Changes' : 'Create Deal'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Deal Detail ──────────────────────────────────────────────────────────────

interface DealDetailProps {
  deal: AdminDeal;
  onBack: () => void;
  onEdit: () => void;
}

const DealDetail: React.FC<DealDetailProps> = ({ deal, onBack, onEdit }) => {
  const { totalInvested, investorCount } = dealStats(deal.id);
  const investments = ADMIN_INVESTMENTS.filter((i) => i.deal_id === deal.id);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: T.textDim }}
      >
        <ArrowLeft size={12} />
        All Deals
      </button>

      {/* Header */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        {deal.thumbnail_url && (
          <div className="h-40 w-full overflow-hidden">
            <img src={deal.thumbnail_url} alt={deal.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant={STATUS_VARIANT[deal.status]}>{deal.status}</Badge>
            <h2 className="text-lg font-black" style={{ color: T.text }}>{deal.name}</h2>
            <p className="text-xs max-w-2xl" style={{ color: T.textSub }}>{deal.short_description}</p>
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit3 size={11} />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Min Investment', value: `$${deal.min_investment.toLocaleString()}` },
          { label: 'Admin Fee', value: `${deal.admin_fee_percent}%` },
          { label: 'Profit Share', value: `${deal.profit_share_percent}%` },
          { label: 'Total Invested', value: fmt$$(totalInvested), accent: T.gold },
          { label: 'Investors', value: investorCount.toLocaleString(), accent: T.jade },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-sm" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: T.textDim }}>{s.label}</p>
            <p className="text-base font-black" style={{ color: s.accent ?? T.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Long description */}
      <div className="p-6 rounded-sm" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: T.textDim }}>Deal Overview</p>
        <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>{deal.long_description}</p>
        {deal.youtube_url && (
          <a href={deal.youtube_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: T.sky }}
          >
            <ExternalLink size={11} /> Watch Deal Overview
          </a>
        )}
      </div>

      {/* Investment ledger */}
      <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
            Investments ({investments.length})
          </p>
        </div>
        {investments.length === 0 ? (
          <EmptyState title="No investments yet" subtitle="No allocations have been submitted for this deal." />
        ) : (
          <Table headers={['Investor', 'Amount', 'Account', 'Status', 'Date']}>
            {investments.map((inv: AdminInvestment) => (
              <TableRow key={inv.id}>
                <TableCell><span className="text-xs font-bold" style={{ color: T.text }}>{inv.user_id}</span></TableCell>
                <TableCell><span className="font-mono text-xs" style={{ color: T.gold }}>{fmt$$(inv.amount_invested)}</span></TableCell>
                <TableCell><span className="font-mono text-xs" style={{ color: T.textDim }}>{inv.account_id.slice(0, 16)}</span></TableCell>
                <TableCell><Badge variant={STATUS_VARIANT[inv.status]}>{inv.status}</Badge></TableCell>
                <TableCell>{fmtDate(inv.created_at)}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

// ─── Main List ────────────────────────────────────────────────────────────────

export const AdminDeals: React.FC = () => {
  const [deals, setDeals] = useState<AdminDeal[]>(ADMIN_DEALS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<AdminDeal | null>(null);
  const [editingDeal, setEditingDeal] = useState<AdminDeal | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() =>
    deals.filter((d) => {
      const q = query.toLowerCase();
      return (!q || d.name.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || d.status === statusFilter);
    }),
    [deals, query, statusFilter],
  );

  const handleSave = (d: AdminDeal) => {
    setDeals((prev) => {
      const idx = prev.findIndex((x) => x.id === d.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = d; return next; }
      return [d, ...prev];
    });
    setShowForm(false);
    setEditingDeal(undefined);
    if (selectedDeal?.id === d.id) setSelectedDeal(d);
  };

  if (selectedDeal) {
    return (
      <>
        <DealDetail
          deal={selectedDeal}
          onBack={() => setSelectedDeal(null)}
          onEdit={() => { setEditingDeal(selectedDeal); setShowForm(true); }}
        />
        {showForm && (
          <DealForm initial={editingDeal} onSave={handleSave} onClose={() => { setShowForm(false); setEditingDeal(undefined); }} />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Deals"
        subtitle={`${deals.length} deals on the platform`}
        action={
          <Button size="sm" onClick={() => { setEditingDeal(undefined); setShowForm(true); }}>
            <Plus size={12} />
            New Deal
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals…"
            style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
            className="w-full rounded-sm pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500/60 placeholder:text-slate-700"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }}><X size={12} /></button>}
        </div>
        <div className="flex gap-1.5">
          {['all', 'open', 'funded', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all"
              style={{
                background: statusFilter === s ? T.goldFaint : T.raised,
                border: `1px solid ${statusFilter === s ? `${T.gold}40` : T.border}`,
                color: statusFilter === s ? T.gold : T.textDim,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {filtered.length === 0 ? (
          <EmptyState title="No deals found" subtitle="Try adjusting your search." />
        ) : (
          <Table headers={['Deal', 'Status', 'Min Invest', 'Total Invested', 'Investors', 'Fee', 'Created', '']}>
            {filtered.map((d) => {
              const { totalInvested, investorCount } = dealStats(d.id);
              return (
                <TableRow key={d.id} className="cursor-pointer" onClick={() => setSelectedDeal(d)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {d.thumbnail_url && (
                        <img src={d.thumbnail_url} alt="" className="w-8 h-8 rounded-sm object-cover flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold max-w-[200px] truncate" style={{ color: T.text }}>{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[d.status]}>{d.status}</Badge></TableCell>
                  <TableCell><span className="font-mono text-xs">${d.min_investment.toLocaleString()}</span></TableCell>
                  <TableCell><span className="font-mono text-xs" style={{ color: T.gold }}>{fmt$$(totalInvested)}</span></TableCell>
                  <TableCell>{investorCount}</TableCell>
                  <TableCell>{d.admin_fee_percent}%</TableCell>
                  <TableCell>{fmtDate(d.created_at)}</TableCell>
                  <TableCell><span style={{ color: T.textDim }}>›</span></TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </div>

      {showForm && (
        <DealForm
          initial={editingDeal}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingDeal(undefined); }}
        />
      )}
    </div>
  );
};
