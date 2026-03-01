import React, { useState, useMemo } from 'react';
import { Search, X, MessageSquare, ArrowLeft } from 'lucide-react';
import { ADMIN_MESSAGES, AdminMessage } from '../../lib/adminData';
import { T, Badge, Button, SectionHeading, EmptyState, Table, TableRow, TableCell } from '../UIElements';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  return fmtDate(iso);
}

const STATUS_VARIANT: Record<AdminMessage['status'], 'ruby' | 'gold' | 'jade'> = {
  new: 'ruby', in_progress: 'gold', resolved: 'jade',
};

type FilterStatus = 'all' | AdminMessage['status'];

// ─── Message Detail ───────────────────────────────────────────────────────────

interface MessageDetailProps {
  message: AdminMessage;
  onBack: () => void;
  onUpdateStatus: (id: string, status: AdminMessage['status']) => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message, onBack, onUpdateStatus }) => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((n) => [...n, note.trim()]);
    setNote('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: T.textDim }}
      >
        <ArrowLeft size={12} />
        All Messages
      </button>

      {/* Message card */}
      <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="px-7 py-5 flex items-start justify-between gap-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[message.status]}>{message.status.replace('_', ' ')}</Badge>
              <span className="text-[9px]" style={{ color: T.textDim }}>{fmtRelative(message.created_at)}</span>
            </div>
            <h2 className="text-sm font-black" style={{ color: T.text }}>{message.subject}</h2>
          </div>
          <div className="flex gap-1.5">
            {(['new', 'in_progress', 'resolved'] as AdminMessage['status'][])
              .filter((s) => s !== message.status)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(message.id, s)}
                  className="px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all hover:opacity-80"
                  style={{
                    background: T.raised,
                    border: `1px solid ${T.border}`,
                    color: T.textDim,
                  }}
                >
                  Mark {s.replace('_', ' ')}
                </button>
              ))}
          </div>
        </div>

        {/* Sender info */}
        <div className="grid grid-cols-3 divide-x" style={{ borderBottom: `1px solid ${T.border}`, divideColor: T.border }}>
          {[
            { label: 'From', value: message.user_name ?? 'Unknown' },
            { label: 'Email', value: message.email },
            { label: 'Received', value: fmtDate(message.created_at) },
          ].map((item) => (
            <div key={item.label} className="px-6 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: T.textDim }}>{item.label}</p>
              <p className="text-xs font-medium truncate" style={{ color: T.textSub }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Message body */}
        <div className="px-7 py-6">
          <p className="text-sm leading-relaxed" style={{ color: T.textSub }}>{message.message}</p>
        </div>
      </div>

      {/* Internal notes */}
      <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
            Internal Notes ({notes.length})
          </p>
        </div>
        <div className="px-6 py-5 space-y-3">
          {notes.length === 0 && (
            <p className="text-xs" style={{ color: T.textDim }}>No internal notes yet.</p>
          )}
          {notes.map((n, i) => (
            <div key={i} className="p-3 rounded-sm text-xs" style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.textSub }}>
              {n}
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
              placeholder="Add internal note…"
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
              className="flex-1 rounded-sm px-4 py-2.5 text-sm outline-none focus:border-amber-500/60 placeholder:text-slate-700"
            />
            <Button size="sm" onClick={addNote} disabled={!note.trim()}>Add</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main List ────────────────────────────────────────────────────────────────

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<AdminMessage[]>(ADMIN_MESSAGES);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selected, setSelected] = useState<AdminMessage | null>(null);

  const updateStatus = (id: string, status: AdminMessage['status']) => {
    setMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, status, updated_at: new Date().toISOString() } : m),
    );
    if (selected?.id === id) setSelected((m) => m ? { ...m, status } : m);
  };

  const filtered = useMemo(() =>
    messages.filter((m) => {
      const q = query.toLowerCase();
      return (filter === 'all' || m.status === filter) &&
        (!q || m.subject.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.user_name ?? '').toLowerCase().includes(q));
    }),
    [messages, query, filter],
  );

  const counts = useMemo(() => ({
    new: messages.filter((m) => m.status === 'new').length,
    in_progress: messages.filter((m) => m.status === 'in_progress').length,
    resolved: messages.filter((m) => m.status === 'resolved').length,
  }), [messages]);

  if (selected) {
    return (
      <MessageDetail
        message={selected}
        onBack={() => setSelected(null)}
        onUpdateStatus={(id, status) => { updateStatus(id, status); }}
      />
    );
  }

  const FILTERS: { key: FilterStatus; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: messages.length },
    { key: 'new', label: 'New', count: counts.new },
    { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { key: 'resolved', label: 'Resolved', count: counts.resolved },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Messages"
        subtitle={`${counts.new} new, ${counts.in_progress} in progress`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'New', value: counts.new, color: T.ruby },
          { label: 'In Progress', value: counts.in_progress, color: T.gold },
          { label: 'Resolved', value: counts.resolved, color: T.jade },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-sm flex items-center gap-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <MessageSquare size={14} style={{ color: s.color }} />
            <div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, sender, or email…"
            style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
            className="w-full rounded-sm pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500/60 placeholder:text-slate-700"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }}><X size={12} /></button>}
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
              style={{
                background: filter === f.key ? T.goldFaint : T.raised,
                border: `1px solid ${filter === f.key ? `${T.gold}40` : T.border}`,
                color: filter === f.key ? T.gold : T.textDim,
              }}
            >
              {f.label}
              {f.count !== undefined && (
                <span className="px-1 py-0.5 rounded-sm" style={{ background: filter === f.key ? `${T.gold}20` : T.border, color: filter === f.key ? T.gold : T.textDim }}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {filtered.length === 0 ? (
          <EmptyState title="No messages found" subtitle="Try adjusting filters or search." />
        ) : (
          <Table headers={['Status', 'Subject', 'From', 'Email', 'Received', 'Action']}>
            {filtered.map((m) => (
              <TableRow key={m.id} className="cursor-pointer" onClick={() => setSelected(m)}>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[m.status]}>{m.status.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold max-w-[200px] truncate block" style={{ color: T.text }}>
                    {m.subject}
                  </span>
                </TableCell>
                <TableCell>{m.user_name ?? '—'}</TableCell>
                <TableCell><span className="text-xs" style={{ color: T.textSub }}>{m.email}</span></TableCell>
                <TableCell>{fmtRelative(m.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {m.status !== 'in_progress' && (
                      <button
                        onClick={() => updateStatus(m.id, 'in_progress')}
                        className="px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest"
                        style={{ background: T.goldFaint, color: T.gold, border: `1px solid ${T.gold}30` }}
                      >
                        In Progress
                      </button>
                    )}
                    {m.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(m.id, 'resolved')}
                        className="px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest"
                        style={{ background: T.jadeFaint, color: T.jade, border: `1px solid ${T.jade}30` }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
