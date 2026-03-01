import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  Users, CheckCircle2, TrendingUp, Share2, DollarSign,
  Wallet, BarChart2, Clock, UserX, Layers,
} from 'lucide-react';
import { computeKPIs, fmt$$ } from '../../lib/adminData';
import { T, ProgressBar } from '../UIElements';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(n: number): string { return `${n.toFixed(1)}%`; }
function round1(n: number): string { return n.toFixed(1); }

const SECTION_ACCENT: Record<string, string> = {
  Activation: T.jade,
  Retention: T.sky,
  Referral: '#A78BFA',
  Revenue: T.gold,
  Core: T.textSub,
};

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  pctValue?: number;
  accent: string;
  icon: React.ElementType;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, sub, pctValue, accent, icon: Icon }) => (
  <div
    className="p-5 rounded-sm space-y-3"
    style={{ background: T.surface, border: `1px solid ${T.border}` }}
  >
    <div className="flex items-center justify-between">
      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
        {label}
      </p>
      <div
        className="w-7 h-7 rounded-sm flex items-center justify-center"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        <Icon size={13} style={{ color: accent }} />
      </div>
    </div>
    <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
    {sub && <p className="text-[9px]" style={{ color: T.textDim }}>{sub}</p>}
    {pctValue !== undefined && (
      <ProgressBar value={pctValue} color={accent} />
    )}
  </div>
);

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ label, children }) => {
  const accent = SECTION_ACCENT[label] ?? T.gold;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-4 rounded-full" style={{ background: accent }} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>
          {label}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
};

// Custom tooltip for recharts
const ChartTooltip: React.FC<{ active?: boolean; payload?: {value: number}[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-sm text-[10px]"
      style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
    >
      <p style={{ color: T.textDim }}>{label}</p>
      <p className="font-bold">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const BarTooltip: React.FC<{ active?: boolean; payload?: {value: number; name: string}[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-sm text-[10px]"
      style={{ background: T.raised, border: `1px solid ${T.border}`, color: T.text }}
    >
      <p style={{ color: T.textDim }}>{label}</p>
      <p className="font-bold">{payload[0].value} accounts</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const kpis = useMemo(() => computeKPIs(), []);

  const accountTypeData = useMemo(() => {
    const labels: Record<string, string> = {
      individual: 'Individual', ira: 'IRA', corporation: 'Corp',
      joint: 'Joint', trust: 'Trust', revocable_trust: 'Rev. Trust', '401k': '401k',
    };
    return Object.entries(kpis.accountsByType)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ name: labels[type] ?? type, count }));
  }, [kpis]);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users',     value: kpis.totalUsers.toLocaleString(),     icon: Users,    accent: T.text },
          { label: 'Accredited',      value: kpis.accreditedUsers.toLocaleString(), icon: CheckCircle2, accent: T.jade },
          { label: 'Total AUM',       value: fmt$$(kpis.totalAUM),                 icon: DollarSign, accent: T.gold },
          { label: 'Avg Ticket Size', value: fmt$$(kpis.avgTicketSize),            icon: Wallet,   accent: T.sky },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-sm flex flex-col gap-3"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
                {s.label}
              </p>
              <s.icon size={13} style={{ color: s.accent }} />
            </div>
            <p className="text-3xl font-black" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* AARRR Sections */}
      <Section label="Activation">
        <KPICard
          label="Accreditation Rate"
          value={pct(kpis.accreditationRate)}
          sub={`${kpis.accreditedUsers} of ${kpis.totalUsers} users verified`}
          pctValue={kpis.accreditationRate}
          accent={T.jade}
          icon={CheckCircle2}
        />
        <KPICard
          label="First Allocation Rate"
          value={pct(kpis.firstAllocationRate)}
          sub={`${kpis.usersWithInvestments} users have invested`}
          pctValue={kpis.firstAllocationRate}
          accent={T.jade}
          icon={TrendingUp}
        />
      </Section>

      <Section label="Retention">
        <KPICard
          label="30-Day Return Rate"
          value={pct(kpis.retentionRate30d)}
          sub={`${kpis.usersRetained30d} users active in last 30 days`}
          pctValue={kpis.retentionRate30d}
          accent={T.sky}
          icon={TrendingUp}
        />
        <KPICard
          label="Avg Sessions / User"
          value={round1(kpis.avgSessionsPerUser)}
          sub="sessions per active user (30d)"
          accent={T.sky}
          icon={Clock}
        />
        <KPICard
          label="Avg Screen Time"
          value={`${round1(kpis.avgScreenTimeMinutes)} min`}
          sub="average session duration"
          accent={T.sky}
          icon={Clock}
        />
      </Section>

      <Section label="Referral">
        <KPICard
          label="Referral Participation"
          value={pct(kpis.referralParticipationRate)}
          sub={`${kpis.usersWhoReferred} users referred others`}
          pctValue={kpis.referralParticipationRate}
          accent="#A78BFA"
          icon={Share2}
        />
        <KPICard
          label="Accredited Referral Rate"
          value={pct(kpis.accreditedReferralRate)}
          sub="of referrals are accredited investors"
          pctValue={kpis.accreditedReferralRate}
          accent="#A78BFA"
          icon={CheckCircle2}
        />
      </Section>

      <Section label="Revenue">
        <KPICard
          label="Avg Admin Fee"
          value={`${kpis.avgAdminFeePercent.toFixed(2)}%`}
          sub="average across all deals"
          accent={T.gold}
          icon={DollarSign}
        />
        <KPICard
          label="Avg Profit Share"
          value={`${kpis.avgProfitSharePercent.toFixed(1)}%`}
          sub="carried interest on deals"
          accent={T.gold}
          icon={BarChart2}
        />
      </Section>

      <Section label="Core">
        <KPICard
          label="Users Without Investments"
          value={kpis.usersWithoutInvestments.toLocaleString()}
          sub={`${pct((kpis.usersWithoutInvestments / kpis.totalUsers) * 100)} of all users`}
          accent={T.textSub}
          icon={UserX}
        />
        <KPICard
          label="Avg Accounts / User"
          value={round1(kpis.avgAccountsPerUser)}
          sub="investment accounts per user"
          accent={T.textSub}
          icon={Layers}
        />
        <KPICard
          label="Avg Deals / Investor"
          value={round1(kpis.avgDealsPerUser)}
          sub="diversification index"
          accent={T.textSub}
          icon={Briefcase}
        />
        <KPICard
          label="% Accredited Users"
          value={pct(kpis.accreditationRate)}
          sub="verified accredited investors"
          pctValue={kpis.accreditationRate}
          accent={T.textSub}
          icon={CheckCircle2}
        />
      </Section>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth */}
        <div
          className="p-6 rounded-sm"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-0.5 h-4 rounded-full" style={{ background: T.gold }} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: T.textDim }}>
              User Growth (12 mo.)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={kpis.userGrowthByMonth} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.gold} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${T.border}80`} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: T.textDim }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: T.textDim }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="cumulative" stroke={T.gold} strokeWidth={2} fill="url(#goldGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Accounts by type */}
        <div
          className="p-6 rounded-sm"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-0.5 h-4 rounded-full" style={{ background: T.jade }} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: T.textDim }}>
              Accounts by Type
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accountTypeData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${T.border}80`} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: T.textDim }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: T.textDim }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="count" fill={T.jade} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account type detail table */}
      <div
        className="p-6 rounded-sm"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-0.5 h-4 rounded-full" style={{ background: T.jade }} />
          <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: T.textDim }}>
            Account Breakdown
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(kpis.accountsByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => {
              const labels: Record<string, string> = {
                individual: 'Individual', ira: 'IRA', corporation: 'Corporation',
                joint: 'Joint', trust: 'Trust', revocable_trust: 'Rev. Trust', '401k': '401k',
              };
              return (
                <div
                  key={type}
                  className="p-3 rounded-sm text-center"
                  style={{ background: T.raised, border: `1px solid ${T.border}` }}
                >
                  <p className="text-xl font-black" style={{ color: T.jade }}>{count}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: T.textDim }}>
                    {labels[type] ?? type}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// Workaround for missing named import from recharts
function Briefcase({ size = 14, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
