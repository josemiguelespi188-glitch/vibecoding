// ─── Admin Portal — Mock Data + KPI Engine ────────────────────────────────────
// All data is generated deterministically from a seeded PRNG so dashboards look
// "live" without requiring a live Supabase connection.
// When Supabase IS configured, swap the exported arrays for real DB queries.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_accredited: boolean;
  created_at: string;
  last_login_at: string;
}

export interface AdminAccount {
  id: string;
  user_id: string;
  account_type: string;
  created_at: string;
}

export interface AdminDeal {
  id: string;
  name: string;
  slug: string;
  status: 'open' | 'closed' | 'funded';
  min_investment: number;
  currency: string;
  thumbnail_url: string;
  youtube_url?: string;
  short_description: string;
  long_description: string;
  admin_fee_percent: number;
  profit_share_percent: number;
  created_at: string;
}

export interface AdminInvestment {
  id: string;
  user_id: string;
  account_id: string;
  deal_id: string;
  deal_name: string;
  amount_invested: number;
  currency: string;
  status: 'submitted' | 'funded' | 'closed';
  created_at: string;
  funded_at?: string;
}

export interface AdminMessage {
  id: string;
  user_id?: string;
  user_name?: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface AdminDocument {
  id: string;
  user_id?: string;
  user_name?: string;
  deal_id?: string;
  deal_name?: string;
  type: 'tax_1099' | 'tax_k1' | 'investor_news' | 'statement' | 'other';
  year?: number;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
}

export interface AdminSettings {
  id: number;
  urgent_banner_enabled: boolean;
  urgent_banner_text: string;
  updated_at: string;
}

export interface AdminReferral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  created_at: string;
}

export interface AdminUserSession {
  id: string;
  user_id: string;
  duration_seconds: number;
  session_start: string;
}

export interface AdminKPIs {
  totalUsers: number;
  accreditedUsers: number;
  accreditationRate: number;
  usersWithInvestments: number;
  firstAllocationRate: number;
  usersRetained30d: number;
  retentionRate30d: number;
  avgSessionsPerUser: number;
  usersWhoReferred: number;
  referralParticipationRate: number;
  accreditedReferralRate: number;
  avgAdminFeePercent: number;
  avgProfitSharePercent: number;
  totalAUM: number;
  avgTicketSize: number;
  avgAccountsPerUser: number;
  usersWithoutInvestments: number;
  avgDealsPerUser: number;
  avgScreenTimeMinutes: number;
  accountsByType: Record<string, number>;
  userGrowthByMonth: Array<{ month: string; cumulative: number }>;
}

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

class SeededRNG {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s = Math.imul(this.s ^ (this.s >>> 15), 0x2c1b3c6d);
    this.s = Math.imul(this.s ^ (this.s >>> 12), 0x297a2d39);
    this.s = (this.s ^ (this.s >>> 15)) >>> 0;
    return this.s / 0x100000000;
  }
  int(min: number, max: number): number { return min + Math.floor(this.next() * (max - min + 1)); }
  choice<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  bool(p: number): boolean { return this.next() < p; }
  isoDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(this.next() * daysAgo));
    return d.toISOString();
  }
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const FIRST = [
  'James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda',
  'William','Barbara','David','Susan','Richard','Jessica','Joseph','Sarah',
  'Thomas','Karen','Charles','Lisa','Christopher','Nancy','Daniel','Betty',
  'Matthew','Margaret','Anthony','Sandra','Mark','Ashley','Donald','Emily',
  'Steven','Donna','Paul','Michelle','Andrew','Dorothy','Joshua','Carol',
];
const LAST = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
  'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
  'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen',
  'Hill','Flores',
];
const DOMAINS = [
  'gmail.com','yahoo.com','outlook.com','privateoffice.com',
  'capitalalliance.com','wealthstreet.com','fingroup.net',
  'venture-capital.io','primeportfolio.com','investmentgroup.com',
];
const ACCOUNT_TYPES = [
  'individual','individual','individual','individual',
  'ira','ira','ira',
  'corporation','corporation',
  'joint','joint',
  'trust',
  'revocable_trust',
  '401k',
];

// ─── Deals ────────────────────────────────────────────────────────────────────

export const ADMIN_DEALS: AdminDeal[] = [
  {
    id: 'd-001', name: 'Meridian Industrial Complex — Dallas', slug: 'meridian-industrial-dallas',
    status: 'funded', min_investment: 50000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1565610222536-ef125173a25f?w=600',
    short_description: 'Class-A industrial warehouse complex in the DFW metroplex.',
    long_description: 'A 1.2M sq-ft Class-A logistics hub serving blue-chip e-commerce and freight tenants. Located minutes from DFW International Airport with direct highway access. NNN leases provide stable cash flow with 3% annual escalators.',
    admin_fee_percent: 1.5, profit_share_percent: 20,
    created_at: '2022-03-15T00:00:00Z',
  },
  {
    id: 'd-002', name: 'Sunbelt Multifamily IV', slug: 'sunbelt-multifamily-iv',
    status: 'open', min_investment: 25000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
    short_description: '320-unit Class-B multifamily community in Phoenix metro.',
    long_description: 'Value-add acquisition targeting a 320-unit community built in 2004. Planned $12,000-per-unit interior renovation program to drive 18-22% rental upside. Pro forma 18.4% IRR over a 5-year hold.',
    admin_fee_percent: 1.5, profit_share_percent: 20,
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'd-003', name: 'Phoenix Logistics Hub', slug: 'phoenix-logistics-hub',
    status: 'closed', min_investment: 50000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
    short_description: 'Last-mile logistics facility in the Greater Phoenix MSA.',
    long_description: 'Fully-leased 280,000 sq-ft last-mile distribution center on 18 acres. Tenant covenants include two Fortune 100 companies. Closed at a 5.8% cap rate with below-market financing locked in.',
    admin_fee_percent: 1.75, profit_share_percent: 20,
    created_at: '2021-09-01T00:00:00Z',
  },
  {
    id: 'd-004', name: 'Coastal Retail Portfolio', slug: 'coastal-retail-portfolio',
    status: 'funded', min_investment: 30000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=600',
    short_description: '11-property strip retail portfolio across Florida's Gulf Coast.',
    long_description: 'Grocery-anchored and necessity-based retail centers in high-growth coastal Florida markets. Weighted average lease term of 9.2 years with CPI-linked escalators. Targets 12-14% annual cash-on-cash.',
    admin_fee_percent: 1.5, profit_share_percent: 18,
    created_at: '2022-11-20T00:00:00Z',
  },
  {
    id: 'd-005', name: 'Mountain States Self-Storage II', slug: 'mountain-states-self-storage-ii',
    status: 'open', min_investment: 20000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
    short_description: 'Portfolio of 6 climate-controlled self-storage facilities in CO & UT.',
    long_description: 'Institutional-quality self-storage assets in supply-constrained mountain west submarkets. 92% average occupancy with room to push rates 8-12% through light renovation and dynamic pricing software.',
    admin_fee_percent: 1.5, profit_share_percent: 20,
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'd-006', name: 'Desert Sun Solar Farm', slug: 'desert-sun-solar-farm',
    status: 'open', min_investment: 50000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
    short_description: '180 MW utility-scale solar project in the Mojave Desert.',
    long_description: 'Long-term PPA with an investment-grade utility at $42/MWh for 25 years. Construction-to-permanent financing secured. Tax equity structured to deliver 8-10% net yield from Year 1 with ITC benefits.',
    admin_fee_percent: 1.0, profit_share_percent: 15,
    created_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'd-007', name: 'Eastern Seaboard Office Complex', slug: 'eastern-seaboard-office',
    status: 'closed', min_investment: 75000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
    short_description: 'Trophy suburban office campus 25 miles from Washington D.C.',
    long_description: 'Three-building campus totaling 620,000 sq-ft leased to federal contractors with 7-year remaining terms. Below-replacement-cost basis with optionality for residential conversion.',
    admin_fee_percent: 2.0, profit_share_percent: 20,
    created_at: '2021-05-15T00:00:00Z',
  },
  {
    id: 'd-008', name: 'Great Lakes Residential Fund', slug: 'great-lakes-residential-fund',
    status: 'funded', min_investment: 25000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600',
    short_description: 'Diversified SFR rental portfolio across Midwest growth markets.',
    long_description: '450-home single-family rental portfolio acquired below replacement cost in Columbus, Indianapolis, and Milwaukee. Professional management platform in place. Targets 15%+ IRR over a 5-year hold.',
    admin_fee_percent: 1.5, profit_share_percent: 20,
    created_at: '2023-02-28T00:00:00Z',
  },
  {
    id: 'd-009', name: 'Pacific Northwest Timber REIT', slug: 'pacific-northwest-timber-reit',
    status: 'open', min_investment: 100000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
    short_description: '85,000 acres of sustainably-managed timberland in Oregon & Washington.',
    long_description: 'Biological growth plus inflation-linked land value appreciation. Carbon-credit monetization adds supplemental yield layer. Target 10-12% total return with low correlation to public markets.',
    admin_fee_percent: 1.0, profit_share_percent: 15,
    created_at: '2024-04-15T00:00:00Z',
  },
  {
    id: 'd-010', name: 'Southeast Medical Office Buildings', slug: 'southeast-medical-office',
    status: 'open', min_investment: 30000, currency: 'USD',
    thumbnail_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600',
    short_description: '14-property medical office portfolio anchored by health systems.',
    long_description: 'Healthcare-adjacent real estate leased to hospital systems and specialty practices on long-term absolute-net terms. Average building age of 8 years. Mission-critical tenant base provides recession resilience.',
    admin_fee_percent: 1.5, profit_share_percent: 20,
    created_at: '2024-07-10T00:00:00Z',
  },
];

// ─── Generate Users, Accounts, Investments ────────────────────────────────────

const rng = new SeededRNG(42);
const now = new Date();

function daysAgo(d: number): string {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

function monthsAgo(m: number): string {
  const dt = new Date(now);
  dt.setMonth(dt.getMonth() - m);
  return dt.toISOString();
}

export const ADMIN_USERS: AdminUser[] = Array.from({ length: 150 }, (_, i) => {
  const first = FIRST[rng.int(0, FIRST.length - 1)];
  const last  = LAST[rng.int(0, LAST.length - 1)];
  const domain = DOMAINS[rng.int(0, DOMAINS.length - 1)];
  const suffix = rng.int(1, 99);
  // Spread sign-ups over 24 months, more recent = more users (growth curve)
  const ageMonths = rng.int(0, Math.min(24, i / 3 + 2));
  const daysCreated = ageMonths * 30 + rng.int(0, 29);
  const daysLastLogin = rng.int(0, 120);
  return {
    id: `usr-${String(i + 1).padStart(3, '0')}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${suffix}@${domain}`,
    is_accredited: rng.bool(0.647),
    created_at: daysAgo(daysCreated),
    last_login_at: daysAgo(daysLastLogin),
  };
});

export const ADMIN_ACCOUNTS: AdminAccount[] = [];
const _accountMap: Record<string, AdminAccount[]> = {};

ADMIN_USERS.forEach((u) => {
  const count = rng.int(1, 3);
  const accs: AdminAccount[] = [];
  for (let j = 0; j < count; j++) {
    const acc: AdminAccount = {
      id: `acc-${u.id}-${j}`,
      user_id: u.id,
      account_type: ACCOUNT_TYPES[rng.int(0, ACCOUNT_TYPES.length - 1)],
      created_at: daysAgo(rng.int(0, 700)),
    };
    ADMIN_ACCOUNTS.push(acc);
    accs.push(acc);
  }
  _accountMap[u.id] = accs;
});

export const ADMIN_INVESTMENTS: AdminInvestment[] = [];
const _investmentMap: Record<string, AdminInvestment[]> = {};
const INV_STATUSES: AdminInvestment['status'][] = ['submitted', 'funded', 'funded', 'funded', 'closed'];

ADMIN_USERS.forEach((u, idx) => {
  // ~55% of users invest (more likely if accredited)
  const prob = u.is_accredited ? 0.72 : 0.18;
  if (!rng.bool(prob)) { _investmentMap[u.id] = []; return; }

  const count = rng.int(1, 4);
  const usedDeals = new Set<string>();
  const accs = _accountMap[u.id] ?? [];
  const inv: AdminInvestment[] = [];

  for (let k = 0; k < count; k++) {
    const deal = ADMIN_DEALS[rng.int(0, ADMIN_DEALS.length - 1)];
    if (usedDeals.has(deal.id)) continue;
    usedDeals.add(deal.id);

    // Ticket size distribution
    let amount: number;
    const tier = rng.next();
    if (tier < 0.45) amount = rng.int(deal.min_investment, 100000);
    else if (tier < 0.80) amount = rng.int(100000, 500000);
    else amount = rng.int(500000, 2000000);
    amount = Math.round(amount / 5000) * 5000;

    const daysCreated = rng.int(0, 600);
    const status = INV_STATUSES[rng.int(0, INV_STATUSES.length - 1)];
    const record: AdminInvestment = {
      id: `inv-${idx}-${k}`,
      user_id: u.id,
      account_id: accs.length ? accs[rng.int(0, accs.length - 1)].id : '',
      deal_id: deal.id,
      deal_name: deal.name,
      amount_invested: amount,
      currency: 'USD',
      status,
      created_at: daysAgo(daysCreated),
      funded_at: status !== 'submitted' ? daysAgo(daysCreated - rng.int(5, 30)) : undefined,
    };
    inv.push(record);
    ADMIN_INVESTMENTS.push(record);
  }
  _investmentMap[u.id] = inv;
});

// ─── Referrals ────────────────────────────────────────────────────────────────

export const ADMIN_REFERRALS: AdminReferral[] = [];
const shuffled = [...ADMIN_USERS].sort(() => rng.next() - 0.5);
const referrers = shuffled.slice(0, 30);
const referrable = shuffled.slice(30, 80);
referrers.forEach((referrer, i) => {
  const referred = referrable[i % referrable.length];
  ADMIN_REFERRALS.push({
    id: `ref-${i}`,
    referrer_user_id: referrer.id,
    referred_user_id: referred.id,
    created_at: daysAgo(rng.int(30, 400)),
  });
});

// ─── User Sessions ────────────────────────────────────────────────────────────

export const ADMIN_SESSIONS: AdminUserSession[] = [];
ADMIN_USERS.slice(0, 100).forEach((u, i) => {
  const sessionCount = rng.int(1, 6);
  for (let s = 0; s < sessionCount; s++) {
    const duration = rng.int(180, 3600); // 3 min – 60 min
    ADMIN_SESSIONS.push({
      id: `sess-${i}-${s}`,
      user_id: u.id,
      duration_seconds: duration,
      session_start: daysAgo(rng.int(0, 30)),
    });
  }
});

// ─── Messages / Inquiries ─────────────────────────────────────────────────────

const MSG_SUBJECTS = [
  'Question about minimum investment amount',
  'Accreditation verification — next steps',
  'How do I transfer my IRA funds?',
  'Quarterly report for Meridian Industrial',
  'K-1 form not received for 2023',
  'Interest in Sunbelt Multifamily IV deal',
  'How to add a joint account?',
  'Wire transfer confirmation needed',
  'Distribution payment inquiry',
  'Request for investment statement',
  'Pacific Northwest Timber — investor update',
  'Account upgrade to Corporation',
  'Tax document availability',
  'Performance report request',
  'New allocation — confirmation needed',
  'Desert Sun Solar — due diligence documents',
  'Schedule a call with investment team',
  'Trouble logging into my account',
  '1099 form discrepancy',
  'Medical Office deal — distribution timeline',
  'Reinvestment options for maturing deal',
  'Interest in co-investment opportunity',
  'Quarterly webinar access code',
  'Update to mailing address',
  'Increase allocation on existing deal',
  'Platform access for my spouse',
  'Subscription agreement question',
  'Great Lakes Residential Fund — exit timeline',
  'Question about carried interest structure',
  'Document upload failed — need assistance',
];

const MSG_STATUS: AdminMessage['status'][] = ['new', 'new', 'in_progress', 'in_progress', 'resolved'];

export const ADMIN_MESSAGES: AdminMessage[] = MSG_SUBJECTS.map((subject, i) => {
  const user = ADMIN_USERS[rng.int(0, 149)];
  const daysOld = rng.int(0, 90);
  return {
    id: `msg-${String(i + 1).padStart(3, '0')}`,
    user_id: user.id,
    user_name: user.name,
    email: user.email,
    subject,
    message: `Dear Axis team, I'm writing regarding ${subject.toLowerCase()}. Please let me know the best way to proceed. I've reviewed the platform documentation but couldn't find a clear answer. Thank you for your time and assistance.`,
    status: MSG_STATUS[rng.int(0, MSG_STATUS.length - 1)],
    created_at: daysAgo(daysOld),
    updated_at: daysAgo(Math.max(0, daysOld - rng.int(0, 5))),
  };
});

// ─── Documents ────────────────────────────────────────────────────────────────

const DOC_TYPES: AdminDocument['type'][] = [
  'tax_1099','tax_k1','investor_news','statement','other',
];

const DOC_CONFIGS = [
  { type: 'tax_1099', title: '2023 Form 1099 — Meridian Industrial', year: 2023, deal: ADMIN_DEALS[0] },
  { type: 'tax_1099', title: '2022 Form 1099 — Phoenix Logistics Hub', year: 2022, deal: ADMIN_DEALS[2] },
  { type: 'tax_k1', title: '2023 Schedule K-1 — Coastal Retail Portfolio', year: 2023, deal: ADMIN_DEALS[3] },
  { type: 'tax_k1', title: '2022 Schedule K-1 — Great Lakes Residential Fund', year: 2022, deal: ADMIN_DEALS[7] },
  { type: 'tax_k1', title: '2023 Schedule K-1 — Eastern Seaboard Office', year: 2023, deal: ADMIN_DEALS[6] },
  { type: 'investor_news', title: 'Q4 2024 Platform Investor Update', year: 2024, deal: undefined },
  { type: 'investor_news', title: 'Q3 2024 Portfolio Performance Summary', year: 2024, deal: undefined },
  { type: 'investor_news', title: 'Sunbelt Multifamily IV — Acquisition Memo', year: 2024, deal: ADMIN_DEALS[1] },
  { type: 'statement', title: 'Annual Portfolio Statement — 2023', year: 2023, deal: undefined },
  { type: 'statement', title: 'H1 2024 Portfolio Statement', year: 2024, deal: undefined },
  { type: 'other', title: 'Desert Sun Solar — Environmental Impact Report', year: 2024, deal: ADMIN_DEALS[5] },
  { type: 'other', title: 'Pacific Northwest Timber — Carbon Credit Whitepaper', year: 2024, deal: ADMIN_DEALS[8] },
  { type: 'investor_news', title: 'Desert Sun Solar — Construction Update', year: 2024, deal: ADMIN_DEALS[5] },
  { type: 'tax_1099', title: '2023 Form 1099 — Great Lakes Residential Fund', year: 2023, deal: ADMIN_DEALS[7] },
  { type: 'statement', title: 'Q2 2024 Distribution Statement', year: 2024, deal: undefined },
] as const;

export const ADMIN_DOCUMENTS: AdminDocument[] = DOC_CONFIGS.map((cfg, i) => {
  const user = rng.bool(0.4) ? ADMIN_USERS[rng.int(0, 149)] : undefined;
  return {
    id: `doc-${String(i + 1).padStart(3, '0')}`,
    user_id: user?.id,
    user_name: user?.name,
    deal_id: (cfg as {deal?: AdminDeal}).deal?.id,
    deal_name: (cfg as {deal?: AdminDeal}).deal?.name,
    type: cfg.type as AdminDocument['type'],
    year: cfg.year,
    title: cfg.title,
    description: `Official ${cfg.title}. Available for download in PDF format.`,
    file_url: `https://storage.axisplatform.com/docs/${cfg.type}/${cfg.year ?? 'general'}/${cfg.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    created_at: daysAgo(rng.int(0, 365)),
  };
});

// ─── Default Settings ─────────────────────────────────────────────────────────

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  id: 1,
  urgent_banner_enabled: false,
  urgent_banner_text: '',
  updated_at: new Date().toISOString(),
};

// ─── KPI Engine ───────────────────────────────────────────────────────────────

export function computeKPIs(): AdminKPIs {
  const total = ADMIN_USERS.length;
  const accredited = ADMIN_USERS.filter((u) => u.is_accredited).length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const retained30d = ADMIN_USERS.filter(
    (u) => new Date(u.last_login_at) >= thirtyDaysAgo,
  ).length;

  const usersWithInv = new Set(ADMIN_INVESTMENTS.map((i) => i.user_id)).size;
  const uniqueReferrers = new Set(ADMIN_REFERRALS.map((r) => r.referrer_user_id)).size;

  // Referrals where the referred user is accredited
  const accreditedReferralCount = ADMIN_REFERRALS.filter((r) => {
    const referredUser = ADMIN_USERS.find((u) => u.id === r.referred_user_id);
    return referredUser?.is_accredited;
  }).length;
  const accReferralRate = uniqueReferrers > 0 ? accreditedReferralCount / uniqueReferrers : 0;

  const totalAUM = ADMIN_INVESTMENTS.reduce((s, i) => s + i.amount_invested, 0);
  const avgTicket = ADMIN_INVESTMENTS.length > 0 ? totalAUM / ADMIN_INVESTMENTS.length : 0;

  const avgAdminFee =
    ADMIN_DEALS.reduce((s, d) => s + d.admin_fee_percent, 0) / ADMIN_DEALS.length;
  const avgProfitShare =
    ADMIN_DEALS.reduce((s, d) => s + d.profit_share_percent, 0) / ADMIN_DEALS.length;

  const avgAccounts = ADMIN_ACCOUNTS.length / total;

  // Avg deals per investing user
  const dealsPerUser: Record<string, Set<string>> = {};
  ADMIN_INVESTMENTS.forEach((inv) => {
    if (!dealsPerUser[inv.user_id]) dealsPerUser[inv.user_id] = new Set();
    dealsPerUser[inv.user_id].add(inv.deal_id);
  });
  const investingUsers = Object.values(dealsPerUser);
  const avgDeals =
    investingUsers.length > 0
      ? investingUsers.reduce((s, set) => s + set.size, 0) / investingUsers.length
      : 0;

  // Avg screen time (last 30 days)
  const recentSessions = ADMIN_SESSIONS.filter(
    (s) => new Date(s.session_start) >= thirtyDaysAgo,
  );
  const avgScreen =
    recentSessions.length > 0
      ? recentSessions.reduce((s, sess) => s + sess.duration_seconds, 0) /
        recentSessions.length /
        60
      : 0;

  // Avg sessions per user (last 30 days)
  const sessionsByUser: Record<string, number> = {};
  recentSessions.forEach((s) => {
    sessionsByUser[s.user_id] = (sessionsByUser[s.user_id] ?? 0) + 1;
  });
  const usersWithSessions = Object.keys(sessionsByUser).length;
  const avgSessionsPerUser =
    usersWithSessions > 0
      ? Object.values(sessionsByUser).reduce((a, b) => a + b, 0) / usersWithSessions
      : 0;

  // Account type distribution
  const accountsByType: Record<string, number> = {};
  ADMIN_ACCOUNTS.forEach((a) => {
    accountsByType[a.account_type] = (accountsByType[a.account_type] ?? 0) + 1;
  });

  // User growth by month (last 12 months, cumulative)
  const userGrowthByMonth: Array<{ month: string; cumulative: number }> = [];
  for (let m = 11; m >= 0; m--) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - m);
    cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);
    const count = ADMIN_USERS.filter((u) => new Date(u.created_at) <= cutoff).length;
    const label = cutoff.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    userGrowthByMonth.push({ month: label, cumulative: count });
  }

  return {
    totalUsers: total,
    accreditedUsers: accredited,
    accreditationRate: (accredited / total) * 100,
    usersWithInvestments: usersWithInv,
    firstAllocationRate: (usersWithInv / total) * 100,
    usersRetained30d: retained30d,
    retentionRate30d: (retained30d / total) * 100,
    avgSessionsPerUser,
    usersWhoReferred: uniqueReferrers,
    referralParticipationRate: (uniqueReferrers / total) * 100,
    accreditedReferralRate: accReferralRate * 100,
    avgAdminFeePercent: avgAdminFee,
    avgProfitSharePercent: avgProfitShare,
    totalAUM,
    avgTicketSize: avgTicket,
    avgAccountsPerUser: avgAccounts,
    usersWithoutInvestments: total - usersWithInv,
    avgDealsPerUser: avgDeals,
    avgScreenTimeMinutes: avgScreen,
    accountsByType,
    userGrowthByMonth,
  };
}

// ─── Helpers for derived deal stats ──────────────────────────────────────────

export function dealStats(dealId: string): { totalInvested: number; investorCount: number } {
  const invs = ADMIN_INVESTMENTS.filter((i) => i.deal_id === dealId);
  return {
    totalInvested: invs.reduce((s, i) => s + i.amount_invested, 0),
    investorCount: new Set(invs.map((i) => i.user_id)).size,
  };
}

export function userStats(userId: string): {
  accounts: AdminAccount[];
  investments: AdminInvestment[];
} {
  return {
    accounts: _accountMap[userId] ?? [],
    investments: _investmentMap[userId] ?? [],
  };
}

export function fmt$$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
