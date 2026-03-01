-- =============================================================================
-- Axis Platform — Admin Portal Schema + Demo Seed
-- Run against your Supabase project:
--   supabase db reset   (local)
--   psql $DATABASE_URL < supabase/seed_admin_demo_data.sql   (remote)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- SCHEMA
-- =============================================================================

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  is_accredited  BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── accounts ──────────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS account_type_enum AS ENUM (
  'individual', 'ira', 'corporation', 'joint', 'trust', 'revocable_trust', '401k'
);
CREATE TABLE IF NOT EXISTS accounts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type account_type_enum NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- ── deals ─────────────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS deal_status_enum AS ENUM ('open', 'closed', 'funded');
CREATE TABLE IF NOT EXISTS deals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  status                deal_status_enum NOT NULL DEFAULT 'open',
  min_investment        NUMERIC(15,2) NOT NULL,
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  thumbnail_url         TEXT,
  youtube_url           TEXT,
  short_description     TEXT,
  long_description      TEXT,
  admin_fee_percent     NUMERIC(5,2) NOT NULL DEFAULT 1.5,
  profit_share_percent  NUMERIC(5,2) NOT NULL DEFAULT 20,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── investments ───────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS investment_status_enum AS ENUM ('submitted', 'funded', 'closed');
CREATE TABLE IF NOT EXISTS investments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id       UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  deal_id          UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  amount_invested  NUMERIC(15,2) NOT NULL,
  currency         CHAR(3) NOT NULL DEFAULT 'USD',
  status           investment_status_enum NOT NULL DEFAULT 'submitted',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  funded_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_deal_id ON investments(deal_id);

-- ── inquiries (messages) ──────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS inquiry_status_enum AS ENUM ('new', 'in_progress', 'resolved');
CREATE TABLE IF NOT EXISTS inquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     inquiry_status_enum NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── documents ─────────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS document_type_enum AS ENUM (
  'tax_1099', 'tax_k1', 'investor_news', 'statement', 'other'
);
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  deal_id     UUID REFERENCES deals(id) ON DELETE SET NULL,
  type        document_type_enum NOT NULL,
  year        SMALLINT,
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── admin_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_settings (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  urgent_banner_enabled BOOLEAN NOT NULL DEFAULT false,
  urgent_banner_text    TEXT NOT NULL DEFAULT '',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO admin_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ── referrals ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referrer_user_id, referred_user_id)
);

-- ── user_sessions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_start    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end      TIMESTAMPTZ,
  duration_seconds INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Deals are public-readable
CREATE POLICY IF NOT EXISTS "deals_public_read" ON deals FOR SELECT USING (true);

-- Users can read/write their own data
CREATE POLICY IF NOT EXISTS "users_own" ON users
  FOR ALL USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "accounts_own" ON accounts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "investments_own" ON investments
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "inquiries_own" ON inquiries
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "documents_own" ON documents
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "sessions_own" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Uses a PL/pgSQL block for deterministic generation.

DO $$
DECLARE
  first_names TEXT[] := ARRAY[
    'James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda',
    'William','Barbara','David','Susan','Richard','Jessica','Joseph','Sarah',
    'Thomas','Karen','Charles','Lisa','Christopher','Nancy','Daniel','Betty',
    'Matthew','Margaret','Anthony','Sandra','Mark','Ashley','Donald','Emily',
    'Steven','Donna','Paul','Michelle','Andrew','Dorothy','Joshua','Carol'
  ];
  last_names TEXT[] := ARRAY[
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
    'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
    'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
    'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
    'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores'
  ];
  domains TEXT[] := ARRAY[
    'gmail.com','yahoo.com','outlook.com','privateoffice.com',
    'capitalalliance.com','wealthstreet.com','fingroup.net',
    'venture-capital.io','primeportfolio.com','investmentgroup.com'
  ];
  acct_types account_type_enum[] := ARRAY[
    'individual','individual','individual','individual',
    'ira','ira','ira',
    'corporation','corporation',
    'joint','joint',
    'trust','revocable_trust','401k'
  ]::account_type_enum[];
  inv_statuses investment_status_enum[] := ARRAY[
    'submitted','funded','funded','funded','closed'
  ]::investment_status_enum[];

  i INTEGER;
  j INTEGER;
  fname TEXT;
  lname TEXT;
  new_user_id UUID;
  new_acct_id UUID;
  acct_count INTEGER;
  inv_count INTEGER;
  rand_amount NUMERIC;
  rand_status investment_status_enum;
  deal_ids UUID[];
  rand_deal_id UUID;
  msg_subjects TEXT[] := ARRAY[
    'Question about minimum investment amount',
    'Accreditation verification — next steps',
    'How do I transfer my IRA funds?',
    'Quarterly report request',
    'K-1 form not received',
    'Interest in Sunbelt Multifamily IV',
    'Wire transfer confirmation',
    'Distribution payment inquiry',
    'New allocation confirmation needed',
    'Tax document availability',
    'Schedule a call with investment team',
    'Trouble logging in',
    '1099 form discrepancy',
    'Reinvestment options',
    'Interest in co-investment opportunity',
    'Update to mailing address',
    'Subscription agreement question',
    'Question about carried interest structure',
    'Document upload failed',
    'Platform access for my spouse'
  ];
  user_ids UUID[];
  rand_user_id UUID;
BEGIN

  PERFORM setseed(0.42);

  -- ── Insert Deals ────────────────────────────────────────────────────────────
  INSERT INTO deals (id, name, slug, status, min_investment, currency, thumbnail_url, short_description, long_description, admin_fee_percent, profit_share_percent, created_at)
  VALUES
    (gen_random_uuid(), 'Meridian Industrial Complex — Dallas', 'meridian-industrial-dallas',
     'funded', 50000, 'USD',
     'https://images.unsplash.com/photo-1565610222536-ef125173a25f?w=600',
     'Class-A industrial warehouse complex in the DFW metroplex.',
     'A 1.2M sq-ft Class-A logistics hub serving blue-chip e-commerce and freight tenants. NNN leases with 3% annual escalators.',
     1.5, 20, NOW() - INTERVAL '2 years'),
    (gen_random_uuid(), 'Sunbelt Multifamily IV', 'sunbelt-multifamily-iv',
     'open', 25000, 'USD',
     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
     '320-unit Class-B multifamily community in Phoenix metro.',
     'Value-add acquisition. $12,000/unit renovation program driving 18-22% rental upside. Pro forma 18.4% IRR.',
     1.5, 20, NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), 'Phoenix Logistics Hub', 'phoenix-logistics-hub',
     'closed', 50000, 'USD',
     'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
     'Last-mile logistics facility in the Greater Phoenix MSA.',
     'Fully-leased 280,000 sq-ft distribution center. Two Fortune 100 tenants. Closed at 5.8% cap rate.',
     1.75, 20, NOW() - INTERVAL '3 years'),
    (gen_random_uuid(), 'Coastal Retail Portfolio', 'coastal-retail-portfolio',
     'funded', 30000, 'USD',
     'https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=600',
     '11-property strip retail portfolio across Florida''s Gulf Coast.',
     'Grocery-anchored necessity retail. 9.2-year WALT. CPI-linked escalators. 12-14% cash-on-cash target.',
     1.5, 18, NOW() - INTERVAL '18 months'),
    (gen_random_uuid(), 'Mountain States Self-Storage II', 'mountain-states-self-storage-ii',
     'open', 20000, 'USD',
     'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
     'Portfolio of 6 climate-controlled self-storage facilities in CO & UT.',
     '92% avg occupancy. Dynamic pricing + light renovation to push rates 8-12%.',
     1.5, 20, NOW() - INTERVAL '6 months'),
    (gen_random_uuid(), 'Desert Sun Solar Farm', 'desert-sun-solar-farm',
     'open', 50000, 'USD',
     'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
     '180 MW utility-scale solar in the Mojave Desert.',
     '25-year PPA at $42/MWh with investment-grade utility. 8-10% net yield from Year 1.',
     1.0, 15, NOW() - INTERVAL '3 months'),
    (gen_random_uuid(), 'Eastern Seaboard Office Complex', 'eastern-seaboard-office',
     'closed', 75000, 'USD',
     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
     'Trophy suburban office campus 25 miles from Washington D.C.',
     '620,000 sq-ft leased to federal contractors. 7-year remaining terms. Residential conversion optionality.',
     2.0, 20, NOW() - INTERVAL '4 years'),
    (gen_random_uuid(), 'Great Lakes Residential Fund', 'great-lakes-residential-fund',
     'funded', 25000, 'USD',
     'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600',
     'Diversified SFR rental portfolio across Midwest growth markets.',
     '450-home portfolio acquired below replacement cost in Columbus, Indianapolis, Milwaukee. 15%+ IRR target.',
     1.5, 20, NOW() - INTERVAL '14 months'),
    (gen_random_uuid(), 'Pacific Northwest Timber REIT', 'pacific-northwest-timber-reit',
     'open', 100000, 'USD',
     'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
     '85,000 acres of sustainably-managed timberland in OR & WA.',
     'Biological growth + inflation-linked appreciation + carbon credits. 10-12% total return target.',
     1.0, 15, NOW() - INTERVAL '4 months'),
    (gen_random_uuid(), 'Southeast Medical Office Buildings', 'southeast-medical-office',
     'open', 30000, 'USD',
     'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600',
     '14-property medical office portfolio anchored by health systems.',
     'Long-term absolute-net leases to hospital systems and specialty practices. Avg building age 8 years.',
     1.5, 20, NOW() - INTERVAL '2 months')
  ON CONFLICT (slug) DO NOTHING;

  -- Collect deal IDs
  SELECT ARRAY(SELECT id FROM deals ORDER BY created_at) INTO deal_ids;

  -- ── Generate 150 Users + Accounts + Investments ──────────────────────────────
  FOR i IN 1..150 LOOP
    fname := first_names[1 + (floor(random() * array_length(first_names, 1)))::int];
    lname := last_names[1 + (floor(random() * array_length(last_names, 1)))::int];
    new_user_id := gen_random_uuid();

    INSERT INTO users (id, name, email, is_accredited, created_at, last_login_at)
    VALUES (
      new_user_id,
      fname || ' ' || lname,
      lower(left(fname, 1)) || lower(lname) || (floor(random() * 98 + 1))::text
        || '@' || domains[1 + (floor(random() * array_length(domains, 1)))::int],
      random() < 0.65,
      NOW() - (floor(random() * 730) || ' days')::INTERVAL,
      NOW() - (floor(random() * 120) || ' days')::INTERVAL
    ) ON CONFLICT (email) DO NOTHING;

    -- 1-3 accounts per user
    acct_count := 1 + floor(random() * 3)::int;
    FOR j IN 1..acct_count LOOP
      new_acct_id := gen_random_uuid();
      INSERT INTO accounts (id, user_id, account_type, created_at)
      VALUES (
        new_acct_id,
        new_user_id,
        acct_types[1 + (floor(random() * array_length(acct_types, 1)))::int],
        NOW() - (floor(random() * 700) || ' days')::INTERVAL
      );
    END LOOP;

    -- 0-4 investments (more likely if accredited)
    IF random() < 0.55 THEN
      inv_count := 1 + floor(random() * 4)::int;
      FOR j IN 1..inv_count LOOP
        rand_deal_id := deal_ids[1 + (floor(random() * array_length(deal_ids, 1)))::int];
        rand_status  := inv_statuses[1 + (floor(random() * array_length(inv_statuses, 1)))::int];

        -- Ticket size: small 45%, medium 35%, large 20%
        IF random() < 0.45 THEN
          rand_amount := round((20000 + random() * 80000)::numeric / 5000) * 5000;
        ELSIF random() < 0.80 THEN
          rand_amount := round((100000 + random() * 400000)::numeric / 5000) * 5000;
        ELSE
          rand_amount := round((500000 + random() * 1500000)::numeric / 5000) * 5000;
        END IF;

        INSERT INTO investments (user_id, account_id, deal_id, amount_invested, currency, status, created_at, funded_at)
        SELECT
          new_user_id,
          a.id,
          rand_deal_id,
          rand_amount,
          'USD',
          rand_status,
          NOW() - (floor(random() * 600) || ' days')::INTERVAL,
          CASE WHEN rand_status <> 'submitted' THEN NOW() - (floor(random() * 580) || ' days')::INTERVAL ELSE NULL END
        FROM accounts a WHERE a.user_id = new_user_id ORDER BY random() LIMIT 1
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    -- Sessions (60% of users)
    IF random() < 0.6 THEN
      FOR j IN 1..(1 + floor(random() * 5)::int) LOOP
        INSERT INTO user_sessions (user_id, session_start, session_end, duration_seconds)
        VALUES (
          new_user_id,
          NOW() - (floor(random() * 30) || ' days')::INTERVAL,
          NOW() - (floor(random() * 30) || ' days')::INTERVAL + (floor(180 + random() * 3420) || ' seconds')::INTERVAL,
          floor(180 + random() * 3420)::int
        );
      END LOOP;
    END IF;
  END LOOP;

  -- ── Referrals (30 random pairs) ──────────────────────────────────────────────
  SELECT ARRAY(SELECT id FROM users ORDER BY random() LIMIT 60) INTO user_ids;
  FOR i IN 1..30 LOOP
    BEGIN
      INSERT INTO referrals (referrer_user_id, referred_user_id, created_at)
      VALUES (
        user_ids[i],
        user_ids[i + 30],
        NOW() - (floor(random() * 400) || ' days')::INTERVAL
      ) ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;

  -- ── Inquiries ────────────────────────────────────────────────────────────────
  SELECT ARRAY(SELECT id FROM users ORDER BY random() LIMIT 20) INTO user_ids;
  FOR i IN 1..array_length(msg_subjects, 1) LOOP
    rand_user_id := user_ids[1 + (floor(random() * array_length(user_ids, 1)))::int];
    INSERT INTO inquiries (user_id, email, subject, message, status, created_at, updated_at)
    SELECT
      rand_user_id,
      u.email,
      msg_subjects[i],
      'Dear Axis team, I am writing regarding ' || lower(msg_subjects[i]) ||
      '. Please let me know the best way to proceed. Thank you.',
      (ARRAY['new','new','in_progress','in_progress','resolved']::inquiry_status_enum[])[1 + floor(random() * 5)::int],
      NOW() - (floor(random() * 90) || ' days')::INTERVAL,
      NOW() - (floor(random() * 5) || ' days')::INTERVAL
    FROM users u WHERE u.id = rand_user_id;
  END LOOP;

  -- ── Documents ────────────────────────────────────────────────────────────────
  INSERT INTO documents (user_id, deal_id, type, year, title, description, file_url, created_at)
  SELECT NULL, d.id, 'tax_1099', 2023,
    '2023 Form 1099 — ' || d.name,
    'Official 2023 1099 for ' || d.name,
    'https://storage.axisplatform.com/docs/1099/2023/' || d.slug || '.pdf',
    NOW() - INTERVAL '60 days'
  FROM deals d WHERE d.status = 'funded'
  UNION ALL
  SELECT NULL, d.id, 'tax_k1', 2023,
    '2023 Schedule K-1 — ' || d.name,
    'Official 2023 K-1 for ' || d.name,
    'https://storage.axisplatform.com/docs/k1/2023/' || d.slug || '.pdf',
    NOW() - INTERVAL '45 days'
  FROM deals d WHERE d.status IN ('funded','closed') LIMIT 3
  UNION ALL
  VALUES
    (NULL, NULL, 'investor_news', 2024, 'Q4 2024 Platform Investor Update',
     'Quarterly portfolio performance summary for all investors.',
     'https://storage.axisplatform.com/docs/news/q4-2024-update.pdf',
     NOW() - INTERVAL '30 days'),
    (NULL, NULL, 'investor_news', 2024, 'Q3 2024 Portfolio Performance Summary',
     'Q3 2024 performance overview.',
     'https://storage.axisplatform.com/docs/news/q3-2024-summary.pdf',
     NOW() - INTERVAL '90 days'),
    (NULL, NULL, 'statement', 2024, 'H1 2024 Portfolio Statement',
     'Mid-year portfolio statement for all active investors.',
     'https://storage.axisplatform.com/docs/statements/h1-2024.pdf',
     NOW() - INTERVAL '120 days'),
    (NULL, NULL, 'statement', 2023, 'Annual Portfolio Statement — 2023',
     'Full-year 2023 portfolio statement.',
     'https://storage.axisplatform.com/docs/statements/annual-2023.pdf',
     NOW() - INTERVAL '180 days');

END $$;

-- =============================================================================
-- VERIFICATION QUERIES (run to confirm seed worked)
-- =============================================================================
-- SELECT 'users' AS tbl, COUNT(*) FROM users
-- UNION ALL SELECT 'accounts', COUNT(*) FROM accounts
-- UNION ALL SELECT 'deals', COUNT(*) FROM deals
-- UNION ALL SELECT 'investments', COUNT(*) FROM investments
-- UNION ALL SELECT 'inquiries', COUNT(*) FROM inquiries
-- UNION ALL SELECT 'documents', COUNT(*) FROM documents
-- UNION ALL SELECT 'referrals', COUNT(*) FROM referrals
-- UNION ALL SELECT 'user_sessions', COUNT(*) FROM user_sessions;
