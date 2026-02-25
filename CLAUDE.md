# CLAUDE.md — AXIS KEY™ Institutional Private Capital Platform

This file provides guidance for AI assistants working on this codebase.

---

## Project Overview

**AXIS KEY™** is an institutional private capital investment platform built for accredited investors to access curated real estate deals. It is a client-side MVP with mock data — no backend API integration exists yet.

- **App name:** AXIS KEY™ - Institutional Private Capital
- **Purpose:** Portfolio-first private capital infrastructure for real estate diversification
- **Audience:** Accredited investors (individual and institutional)

---

## Technology Stack

| Layer | Technology |
|---|---|
| Language | TypeScript ~5.8.2 |
| UI Framework | React 19.2.4 |
| Build Tool | Vite 6.2.0 |
| CSS | Tailwind CSS (via CDN) |
| Charts | Recharts 3.7.0 |
| Icons | lucide-react 0.563.0 |

---

## Development Workflow

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Setup

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

This is injected into the build as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` via `vite.config.ts`.

### Available Scripts

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Production build
npm run preview   # Preview production build locally
```

The dev server listens on `0.0.0.0:3000` (accessible from external hosts).

### No Test Framework

There are currently **no tests** configured. No Vitest, Jest, or Testing Library dependencies are installed. Do not add test-related boilerplate unless explicitly asked.

---

## Project Structure

```
/
├── App.tsx              # Root component; owns all app-level state
├── index.tsx            # React entry point
├── index.html           # HTML template (Tailwind CDN, custom CSS, import map)
├── types.ts             # All TypeScript interfaces and enums
├── constants.ts         # Brand colors, mock data (MOCK_DEALS, MOCK_ACCOUNTS, etc.)
├── vite.config.ts       # Vite config (port 3000, env injection, @ alias)
├── tsconfig.json        # TypeScript config
├── metadata.json        # AI Studio app metadata
├── package.json
└── components/
    ├── UIElements.tsx       # Shared UI: Button, Badge, Card, SectionHeading
    ├── Navbar.tsx           # Top nav (landing page only)
    ├── Sidebar.tsx          # Left sidebar for portal navigation
    ├── Auth.tsx             # Login/signup + demo user
    ├── Onboarding.tsx       # Multi-step onboarding flow
    ├── Dashboard.tsx        # Main dashboard (metrics, investment ledger)
    ├── Portfolio.tsx        # Deal marketplace listing
    ├── InvestmentModal.tsx  # Multi-step investment allocation workflow
    ├── Accounts.tsx         # Investment account management
    ├── Profile.tsx          # User profile and settings
    ├── ProfilePanel.tsx     # Slide-out profile editor panel
    └── Accreditation.tsx    # Accreditation verification workflow
```

---

## Application State Machine

`App.tsx` controls the top-level app state with the union type:

```ts
type AppState = 'LANDING' | 'AUTH' | 'ONBOARDING' | 'PORTAL';
```

Flow: `LANDING → AUTH → ONBOARDING (if not yet onboarded) → PORTAL`

The portal renders a sidebar + main content area with sub-views: `dashboard`, `portfolio`, `accounts`, `accreditation`, `profile`.

---

## Type System (`types.ts`)

All shared types live in `types.ts`. Key types:

### Enums

```ts
AccreditedStatus    // UNKNOWN | SELF_ATTESTED | VERIFIED | REJECTED
DocumentStatus      // NOT_UPLOADED | UNDER_REVIEW | Verified | Rejected
InvestmentAccountType  // INDIVIDUAL | CORPORATION | TRUST | REVOCABLE_TRUST | IRA | K401 | JOINT
RequestStatus       // PENDING | APPROVED | REJECTED | PENDING_FUNDING | FUNDED | SUBMITTED | UNDER_REVIEW
```

### Key Interfaces

- `User` — authenticated user with accreditation/identity status
- `OnboardingData` — collected during multi-step onboarding
- `Profile` — user profile snapshot
- `Deal` — investment deal with financials (IRR, target raise, structure)
- `InvestmentAccount` — entity-typed investment account
- `InvestmentRequest` — allocation request with status lifecycle
- `Distribution` — dividend/distribution payment record

**Convention:** Always import types from `./types` (not inline). Extend existing interfaces rather than creating parallel ones.

---

## Mock Data (`constants.ts`)

All demo data lives in `constants.ts`:

- `COLORS` — Brand color palette (use these values, not raw hex where avoidable)
- `MOCK_DEALS` — 6 real estate deals (multifamily, office, industrial, etc.)
- `MOCK_ACCOUNTS` — 3 investment accounts
- `MOCK_REQUESTS` — 6 investment allocation requests

**Convention:** When adding new mock data, add it to `constants.ts` and import from there, never inline in components.

---

## Styling Conventions

### Tailwind CSS

Tailwind is loaded via CDN (`index.html`) — **no PostCSS/Tailwind config file exists**. Utility classes are used inline in JSX.

### Brand Color Palette

```ts
bg:            '#081C3A'   // Dark navy background
panel:         '#0F2A4A'   // Panel/card background
axisBlue:      '#0B2E6D'   // Darker blue
royalBlue:     '#1457B6'   // Royal blue
electricBlue:  '#2F80ED'   // Primary interactive blue
cyanGlow:      '#56CCF2'   // Cyan highlight
tealAccent:    '#00E0C6'   // Teal accent / success
textBody:      '#C9D8F0'   // Body text
textMuted:     '#8FAEDB'   // Muted/secondary text
```

Use these values from `COLORS` in `constants.ts` or hard-code the same hex values in Tailwind classes (e.g., `text-[#C9D8F0]`).

### Custom CSS Classes (defined in `index.html`)

- `.glass-panel` — frosted glass card with `backdrop-blur` and border
- `.cyan-glow` — cyan box-shadow glow for interactive cards
- `.scrollbar-hide` — hide scrollbars cross-browser

These are global classes; apply them directly in JSX.

### Responsive Design

Mobile-first with Tailwind breakpoints: `md:` (768px) and `lg:` (1024px). Use flexible grids:

```
grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
```

---

## Component Conventions

- **Functional components only** — no class components
- **Props via TypeScript interfaces** — always define explicit prop types inline or in `types.ts`
- **No global state library** — use `useState` / `useEffect` / `useMemo`; pass state down via props and callbacks
- **Single responsibility** — each component owns one feature area
- **Named exports** — all components use named exports (not default exports)

### Path Alias

The `@/` alias resolves to the project root. Use it for absolute imports:

```ts
import { Deal } from '@/types';
import { COLORS } from '@/constants';
```

---

## Multi-step Workflow Pattern

`InvestmentModal.tsx` and `Onboarding.tsx` follow a multi-step pattern:

```tsx
const [step, setStep] = useState(1);
// Render different JSX based on step
// Include a progress indicator
// next/back handlers update step
```

Follow this pattern for any new multi-step flows.

---

## Demo / Mock Behavior

- The demo user is "Alexander Vanderbilt" — defined in `Auth.tsx`
- Simulated async operations use `setTimeout` (typically 1500–2000ms)
- No real API calls exist; all data mutations update local React state only
- Do not introduce real API calls without explicit instruction

---

## What to Avoid

- **No CSS modules or styled-components** — use Tailwind utility classes only
- **No Redux or Context API** unless explicitly instructed; prop drilling is acceptable at current scale
- **No default exports** for components — use named exports
- **No test files** unless asked
- **No extra npm packages** without explicit approval — the dependency list is intentionally minimal
- **No backend calls** — this is a pure client-side MVP
- **No TypeScript `any`** — use proper types or `unknown` with type guards

---

## Git Conventions

Branch naming: `claude/<description>-<session-id>`

Commit messages should be prefixed:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code restructure without behavior change
- `style:` — styling/CSS only changes
- `docs:` — documentation only

Push with:
```bash
git push -u origin <branch-name>
```
