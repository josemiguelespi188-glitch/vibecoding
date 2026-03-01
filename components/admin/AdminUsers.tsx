import React, { useState, useMemo } from 'react';
import {
  Search, X, ChevronRight, CheckCircle2, XCircle,
  User, Edit3, Plus, ArrowLeft,
} from 'lucide-react';
import {
  ADMIN_USERS, AdminUser, AdminAccount, AdminInvestment,
  userStats, fmt$$,
} from '../../lib/adminData';
import {
  T, Badge, Button, Input, Table, TableRow, TableCell, SectionHeading, EmptyState,
} from '../UIElements';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual', ira: 'IRA', corporation: 'Corporation',
  joint: 'Joint', trust: 'Trust', revocable_trust: 'Rev. Trust', '401k': '401k',
};

// ─── User Detail Panel ────────────────────────────────────────────────────────

interface UserDetailProps {
  user: AdminUser;
  onBack: () => void;
  onSave: (updated: AdminUser) => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ user, onBack, onSave }) => {
  const { accounts, investments } = userStats(user.id);
  const [editing, setEditing] = useState(false);
  const [name, setName]   = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [accredited, setAccredited] = useState(user.is_accredited);

  const totalInvested = investments.reduce((s, i) => s + i.amount_invested, 0);

  const handleSave = () => {
    onSave({ ...user, name, email, is_accredited: accredited });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:opacity-70"
          style={{ color: T.textDim }}
        >
          <ArrowLeft size={12} />
          All Users
        </button>
      </div>

      {/* Header card */}
      <div
        className="p-6 rounded-sm flex items-start justify-between gap-4"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-sm flex items-center justify-center text-lg font-black flex-shrink-0"
            style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.gold }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            {editing ? (
              <div className="space-y-3">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accredited}
                    onChange={(e) => setAccredited(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>
                    Accredited Investor
                  </span>
                </label>
              </div>
            ) : (
              <>
                <p className="text-sm font-black" style={{ color: T.text }}>{user.name}</p>
                <p className="text-xs" style={{ color: T.textSub }}>{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.is_accredited ? 'jade' : 'neutral'}>
                    {user.is_accredited ? 'Accredited' : 'Not Accredited'}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit3 size={11} />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Member Since', value: fmtDate(user.created_at) },
          { label: 'Last Login', value: fmtDate(user.last_login_at) },
          { label: 'Accounts', value: accounts.length.toString() },
          { label: 'Total Invested', value: fmt$$(totalInvested) },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-sm"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: T.textDim }}>
              {s.label}
            </p>
            <p className="text-sm font-bold" style={{ color: T.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Accounts */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
            Investment Accounts ({accounts.length})
          </p>
        </div>
        {accounts.length === 0 ? (
          <EmptyState title="No accounts" subtitle="This user has no investment accounts yet." />
        ) : (
          <Table headers={['Account ID', 'Type', 'Created']}>
            {accounts.map((acc: AdminAccount) => (
              <TableRow key={acc.id}>
                <TableCell><span className="font-mono text-xs" style={{ color: T.textDim }}>{acc.id}</span></TableCell>
                <TableCell>
                  <Badge variant="neutral">{ACCOUNT_TYPE_LABELS[acc.account_type] ?? acc.account_type}</Badge>
                </TableCell>
                <TableCell>{fmtDate(acc.created_at)}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      {/* Investments */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
            Investments ({investments.length})
          </p>
        </div>
        {investments.length === 0 ? (
          <EmptyState title="No investments" subtitle="This user has not submitted any allocations." />
        ) : (
          <Table headers={['Deal', 'Amount', 'Status', 'Date']}>
            {investments.map((inv: AdminInvestment) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <span className="text-xs font-bold" style={{ color: T.text }}>{inv.deal_name}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs" style={{ color: T.gold }}>{fmt$$(inv.amount_invested)}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      inv.status === 'funded' ? 'jade'
                      : inv.status === 'closed' ? 'neutral'
                      : 'gold'
                    }
                  >
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell>{fmtDate(inv.created_at)}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

// ─── New User Modal ───────────────────────────────────────────────────────────

interface NewUserFormProps {
  onClose: () => void;
  onCreate: (u: AdminUser) => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onClose, onCreate }) => {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [accredited, setAccredited] = useState(false);

  const handleCreate = () => {
    if (!name || !email) return;
    onCreate({
      id: `usr-new-${Date.now()}`,
      name, email, is_accredited: accredited,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,8,12,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-md overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.textSub }}>
            New User
          </p>
          <button onClick={onClose} style={{ color: T.textDim }}>✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={accredited} onChange={(e) => setAccredited(e.target.checked)} className="accent-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>
              Mark as Accredited
            </span>
          </label>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} disabled={!name || !email}>Create User</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main List View ───────────────────────────────────────────────────────────

type FilterType = 'all' | 'accredited' | 'no_investment' | 'invested';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = query.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const { investments } = userStats(u.id);
      const hasInv = investments.length > 0;
      const matchFilter =
        filter === 'all' ? true
        : filter === 'accredited' ? u.is_accredited
        : filter === 'no_investment' ? !hasInv
        : hasInv;
      return matchSearch && matchFilter;
    });
  }, [users, query, filter]);

  const handleSave = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setSelectedUser(updated);
  };

  if (selectedUser) {
    return (
      <UserDetail
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onSave={handleSave}
      />
    );
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Users' },
    { key: 'accredited', label: 'Accredited' },
    { key: 'invested', label: 'Has Investments' },
    { key: 'no_investment', label: 'No Investments' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Users"
        subtitle={`${users.length} total registered users`}
        action={
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={12} />
            New User
          </Button>
        }
      />

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
            className="w-full rounded-sm pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:border-amber-500/60 placeholder:text-slate-700"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.textDim }}>
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all"
              style={{
                background: filter === f.key ? T.goldFaint : T.raised,
                border: `1px solid ${filter === f.key ? `${T.gold}40` : T.border}`,
                color: filter === f.key ? T.gold : T.textDim,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="px-6 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textDim }}>
            Showing {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No users found" subtitle="Try adjusting your search or filters." />
        ) : (
          <Table headers={['Name', 'Email', 'Accredited', 'Accounts', 'Investments', 'Joined', '']}>
            {filtered.map((u) => {
              const { accounts, investments } = userStats(u.id);
              return (
                <TableRow key={u.id} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black flex-shrink-0"
                        style={{ background: T.raised, color: T.gold }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold" style={{ color: T.text }}>{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs" style={{ color: T.textSub }}>{u.email}</span>
                  </TableCell>
                  <TableCell>
                    {u.is_accredited
                      ? <CheckCircle2 size={14} style={{ color: T.jade }} />
                      : <XCircle size={14} style={{ color: T.textDim }} />}
                  </TableCell>
                  <TableCell>{accounts.length}</TableCell>
                  <TableCell>{investments.length}</TableCell>
                  <TableCell>{fmtDate(u.created_at)}</TableCell>
                  <TableCell>
                    <ChevronRight size={13} style={{ color: T.textDim }} />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </div>

      {showNew && (
        <NewUserForm
          onClose={() => setShowNew(false)}
          onCreate={(u) => setUsers((prev) => [u, ...prev])}
        />
      )}
    </div>
  );
};
