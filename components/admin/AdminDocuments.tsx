import React, { useState, useMemo } from 'react';
import { Search, X, Upload, FileText, Plus } from 'lucide-react';
import { ADMIN_DOCUMENTS, ADMIN_DEALS, ADMIN_USERS, AdminDocument } from '../../lib/adminData';
import { T, Badge, Button, Input, SectionHeading, EmptyState, Table, TableRow, TableCell } from '../UIElements';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TYPE_LABELS: Record<AdminDocument['type'], string> = {
  tax_1099: '1099', tax_k1: 'K-1', investor_news: 'Investor News', statement: 'Statement', other: 'Other',
};
const TYPE_VARIANTS: Record<AdminDocument['type'], 'gold' | 'sky' | 'jade' | 'neutral' | 'ruby'> = {
  tax_1099: 'gold', tax_k1: 'gold', investor_news: 'sky', statement: 'jade', other: 'neutral',
};

// ─── Upload / Create Form ─────────────────────────────────────────────────────

interface DocFormProps {
  onSave: (d: AdminDocument) => void;
  onClose: () => void;
}

const DocForm: React.FC<DocFormProps> = ({ onSave, onClose }) => {
  const [title, setTitle]   = useState('');
  const [desc, setDesc]     = useState('');
  const [type, setType]     = useState<AdminDocument['type']>('investor_news');
  const [year, setYear]     = useState<number>(new Date().getFullYear());
  const [userId, setUserId] = useState('');
  const [dealId, setDealId] = useState('');
  const [file, setFile]     = useState<File | null>(null);

  const handleSave = () => {
    if (!title) return;
    const user = ADMIN_USERS.find((u) => u.id === userId);
    const deal = ADMIN_DEALS.find((d) => d.id === dealId);
    onSave({
      id: `doc-new-${Date.now()}`,
      title,
      description: desc,
      type,
      year: ['tax_1099', 'tax_k1', 'statement'].includes(type) ? year : undefined,
      user_id: user?.id,
      user_name: user?.name,
      deal_id: deal?.id,
      deal_name: deal?.name,
      file_url: file ? URL.createObjectURL(file) : `https://storage.axisplatform.com/docs/${type}/${title.toLowerCase().replace(/\s+/g,'-')}.pdf`,
      created_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(7,8,12,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-md my-8"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-center justify-between px-7 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textSub }}>Upload Document</p>
          <button onClick={onClose} style={{ color: T.textDim }}>✕</button>
        </div>

        <div className="px-7 py-6 space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2023 Form 1099 — Deal Name" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Document Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdminDocument['type'])}
                style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
                className="w-full rounded-sm px-4 py-2.5 text-sm outline-none"
              >
                <option value="tax_1099">1099</option>
                <option value="tax_k1">Schedule K-1</option>
                <option value="investor_news">Investor News</option>
                <option value="statement">Statement</option>
                <option value="other">Other</option>
              </select>
            </div>
            {['tax_1099', 'tax_k1', 'statement'].includes(type) && (
              <Input label="Tax Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            )}
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>User (optional — leave blank for platform-wide)</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full rounded-sm px-4 py-2.5 text-sm outline-none"
            >
              <option value="">— Platform-wide —</option>
              {ADMIN_USERS.slice(0, 50).map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Deal (optional)</label>
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full rounded-sm px-4 py-2.5 text-sm outline-none"
            >
              <option value="">— Not deal-specific —</option>
              {ADMIN_DEALS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full rounded-sm px-4 py-2.5 text-sm outline-none resize-none placeholder:text-slate-700"
              placeholder="Optional description…"
            />
          </div>

          {/* File upload */}
          <div
            className="rounded-sm border-2 border-dashed p-6 text-center cursor-pointer transition-colors hover:border-amber-500/40"
            style={{ borderColor: file ? T.jade : T.border }}
            onClick={() => document.getElementById('doc-file-input')?.click()}
          >
            <input
              id="doc-file-input"
              type="file"
              accept=".pdf,.xlsx,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Upload size={20} className="mx-auto mb-2" style={{ color: file ? T.jade : T.textDim }} />
            <p className="text-xs font-bold" style={{ color: file ? T.jade : T.textSub }}>
              {file ? file.name : 'Click to upload PDF, XLSX, or DOCX'}
            </p>
            <p className="text-[9px] mt-1" style={{ color: T.textDim }}>
              {file ? `${(file.size / 1024).toFixed(0)} KB` : 'Or it will be stored with a mock URL for demo'}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={!title}>
              <Upload size={12} />
              {file ? 'Upload Document' : 'Save Document'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main List ────────────────────────────────────────────────────────────────

export const AdminDocuments: React.FC = () => {
  const [docs, setDocs]         = useState<AdminDocument[]>(ADMIN_DOCUMENTS);
  const [query, setQuery]       = useState('');
  const [typeFilter, setType]   = useState<string>('all');
  const [yearFilter, setYear]   = useState<string>('all');
  const [scopeFilter, setScope] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const years = useMemo(() => {
    const ys = new Set(docs.filter((d) => d.year).map((d) => String(d.year)));
    return Array.from(ys).sort().reverse();
  }, [docs]);

  const filtered = useMemo(() =>
    docs.filter((d) => {
      const q = query.toLowerCase();
      const matchQ = !q || d.title.toLowerCase().includes(q) || (d.user_name ?? '').toLowerCase().includes(q) || (d.deal_name ?? '').toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || d.type === typeFilter;
      const matchYear = yearFilter === 'all' || String(d.year) === yearFilter;
      const matchScope =
        scopeFilter === 'all' ? true
        : scopeFilter === 'user' ? !!d.user_id
        : scopeFilter === 'deal' ? !!d.deal_id
        : !d.user_id && !d.deal_id;
      return matchQ && matchType && matchYear && matchScope;
    }),
    [docs, query, typeFilter, yearFilter, scopeFilter],
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Documents"
        subtitle={`${docs.length} documents in the library`}
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={12} />
            Upload
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
            className="rounded-sm pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500/60 placeholder:text-slate-700 w-52"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }}><X size={12} /></button>}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setType(e.target.value)}
          style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.textSub }}
          className="rounded-sm px-4 py-2.5 text-xs outline-none"
        >
          <option value="all">All Types</option>
          <option value="tax_1099">1099</option>
          <option value="tax_k1">K-1</option>
          <option value="investor_news">Investor News</option>
          <option value="statement">Statement</option>
          <option value="other">Other</option>
        </select>

        {/* Year filter */}
        <select
          value={yearFilter}
          onChange={(e) => setYear(e.target.value)}
          style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.textSub }}
          className="rounded-sm px-4 py-2.5 text-xs outline-none"
        >
          <option value="all">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Scope filter */}
        <select
          value={scopeFilter}
          onChange={(e) => setScope(e.target.value)}
          style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.textSub }}
          className="rounded-sm px-4 py-2.5 text-xs outline-none"
        >
          <option value="all">All Scopes</option>
          <option value="user">User-specific</option>
          <option value="deal">Deal-specific</option>
          <option value="platform">Platform-wide</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="px-6 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textDim }}>
            Showing {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No documents found" subtitle="Try adjusting filters." />
        ) : (
          <Table headers={['Type', 'Title', 'Year', 'User', 'Deal', 'Uploaded', 'File']}>
            {filtered.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Badge variant={TYPE_VARIANTS[doc.type]}>{TYPE_LABELS[doc.type]}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold block max-w-[200px] truncate" style={{ color: T.text }}>{doc.title}</span>
                  {doc.description && (
                    <span className="text-[9px] block mt-0.5 max-w-[200px] truncate" style={{ color: T.textDim }}>{doc.description}</span>
                  )}
                </TableCell>
                <TableCell>{doc.year ?? '—'}</TableCell>
                <TableCell>
                  <span className="text-xs max-w-[120px] truncate block" style={{ color: T.textSub }}>{doc.user_name ?? '—'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs max-w-[120px] truncate block" style={{ color: T.textSub }}>{doc.deal_name ?? '—'}</span>
                </TableCell>
                <TableCell>{fmtDate(doc.created_at)}</TableCell>
                <TableCell>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: T.sky }}
                  >
                    <FileText size={11} />
                    View
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      {showForm && (
        <DocForm
          onSave={(d) => { setDocs((prev) => [d, ...prev]); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
