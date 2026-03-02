import React, { useState } from 'react';
import { T, Badge, Button } from './UIElements';
import { ChevronLeft, ChevronRight, Phone, Clock, User, X, Calendar } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

type CallType = 'Initial Consultation' | 'Portfolio Review' | 'Deal Walkthrough' | 'Sponsor Meeting';

interface ScheduledCall {
  id: string;
  date: number; // day of month
  time: string;
  name: string;
  role: string;
  type: CallType;
  duration: number; // minutes
  notes: string;
  capitalInterest?: number; // USD
  completed?: boolean;
}

const TYPE_COLORS: Record<CallType, string> = {
  'Initial Consultation': T.gold,
  'Portfolio Review':     T.jade,
  'Deal Walkthrough':     T.sky,
  'Sponsor Meeting':      '#A78BFA',
};

const TYPE_BADGE: Record<CallType, 'gold' | 'jade' | 'sky' | 'neutral'> = {
  'Initial Consultation': 'gold',
  'Portfolio Review':     'jade',
  'Deal Walkthrough':     'sky',
  'Sponsor Meeting':      'neutral',
};

const MARCH_2026_CALLS: ScheduledCall[] = [
  {
    id: 'c1', date: 3, time: '10:00 AM', name: 'James Whitfield', role: 'Family Office Principal',
    type: 'Initial Consultation', duration: 45,
    notes: 'Interested in Phoenix MF Fund. Potential allocation of $150K. Referred by internal LP.',
    capitalInterest: 150000,
  },
  {
    id: 'c2', date: 5, time: '2:00 PM', name: 'Sarah Chen', role: 'HNW Investor',
    type: 'Portfolio Review', duration: 30,
    notes: 'Q4 2025 performance review. Questions about Cornerstone Debt distribution timing.',
    completed: true,
  },
  {
    id: 'c3', date: 6, time: '11:00 AM', name: 'Michael Torres', role: 'LP — Individual Account',
    type: 'Deal Walkthrough', duration: 60,
    notes: 'Deep dive into Urban Core Development. Reviewing sponsor credentials and exit strategy.',
    capitalInterest: 75000,
  },
  {
    id: 'c4', date: 10, time: '9:00 AM', name: 'Robert Okafor', role: 'Family Office CIO',
    type: 'Initial Consultation', duration: 45,
    notes: 'Multi-family office exploring diversified real estate exposure. Very high potential LP.',
    capitalInterest: 500000,
  },
  {
    id: 'c5', date: 11, time: '3:00 PM', name: 'Amanda Liu', role: 'LP — Corporation Account',
    type: 'Portfolio Review', duration: 30,
    notes: 'Annual review meeting. IRR performance and tax document discussion.',
    completed: true,
  },
  {
    id: 'c6', date: 13, time: '10:30 AM', name: 'David Park', role: 'Private Equity LP',
    type: 'Deal Walkthrough', duration: 60,
    notes: 'Cornerstone Debt Fund III — structure walkthrough. Comparing to prior fund performance.',
    capitalInterest: 200000,
  },
  {
    id: 'c7', date: 17, time: '1:00 PM', name: 'Jennifer Walsh', role: 'HNW Investor',
    type: 'Initial Consultation', duration: 45,
    notes: 'New investor. Interest in Multifamily and Private Debt strategies.',
    capitalInterest: 75000,
  },
  {
    id: 'c8', date: 18, time: '4:00 PM', name: 'Carlos Mendez', role: 'Sponsor — Sunrise Partners',
    type: 'Sponsor Meeting', duration: 90,
    notes: 'Sunrise Value Add Fund II discussion. Reviewing track record and structure for new listing.',
  },
  {
    id: 'c9', date: 20, time: '11:00 AM', name: 'Lisa Thompson', role: 'LP — Joint Account',
    type: 'Portfolio Review', duration: 30,
    notes: 'Q1 distribution expectations. Reviewing Metro Workforce Housing progress.',
  },
  {
    id: 'c10', date: 24, time: '9:30 AM', name: 'Andrew Kim', role: 'HNW Investor',
    type: 'Deal Walkthrough', duration: 60,
    notes: 'Metro Workforce Housing walkthrough. Long-term income focus. Excellent fit.',
    capitalInterest: 100000,
  },
  {
    id: 'c11', date: 25, time: '2:30 PM', name: 'Rachel Nguyen', role: 'LP Prospect',
    type: 'Initial Consultation', duration: 45,
    notes: 'Referred by Robert Okafor. Looking for $200K allocation across multiple strategies.',
    capitalInterest: 200000,
  },
  {
    id: 'c12', date: 27, time: '10:00 AM', name: 'Thomas Bradley', role: 'Sponsor — Bradley Capital',
    type: 'Sponsor Meeting', duration: 90,
    notes: 'New sponsor pitch — industrial logistics deal in Dallas, TX. $18M raise target.',
  },
];

// March 2026: starts on Sunday (day 0), 31 days
const MONTH_NAME = 'March 2026';
const DAYS_IN_MONTH = 31;
const FIRST_DAY = 0; // Sunday

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Component ────────────────────────────────────────────────────────────────

export const CallsCalendar: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(2); // Today = March 2
  const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null);

  const callsByDay = MARCH_2026_CALLS.reduce<Record<number, ScheduledCall[]>>((acc, call) => {
    acc[call.date] = acc[call.date] ? [...acc[call.date], call] : [call];
    return acc;
  }, {});

  const selectedDayCalls = selectedDay ? (callsByDay[selectedDay] || []) : [];

  const totalCapitalInterest = MARCH_2026_CALLS.reduce((sum, c) => sum + (c.capitalInterest || 0), 0);
  const completedCalls = MARCH_2026_CALLS.filter((c) => c.completed).length;
  const upcomingCalls = MARCH_2026_CALLS.filter((c) => !c.completed && c.date >= 2).length;

  // Build calendar grid (6 rows × 7 cols)
  const cells: (number | null)[] = [];
  for (let i = 0; i < FIRST_DAY; i++) cells.push(null);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: T.gold }}>Admin</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: T.text }}>Calls Calendar</h1>
          <div className="flex items-center gap-2">
            <Badge variant="jade">{upcomingCalls} Upcoming</Badge>
            <Badge variant="gold">{MARCH_2026_CALLS.length} Total</Badge>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Calls', value: String(MARCH_2026_CALLS.length), color: T.text },
          { label: 'Completed', value: String(completedCalls), color: T.jade },
          { label: 'Upcoming', value: String(upcomingCalls), color: T.gold },
          { label: 'Capital Interest', value: `$${(totalCapitalInterest / 1_000_000).toFixed(1)}M`, color: T.gold },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-sm" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: T.textDim }}>{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {/* Month header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <button className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: T.raised }}>
              <ChevronLeft size={14} style={{ color: T.textDim }} />
            </button>
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: T.gold }} />
              <span className="text-sm font-black uppercase tracking-wider" style={{ color: T.text }}>{MONTH_NAME}</span>
            </div>
            <button className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: T.raised }}>
              <ChevronRight size={14} style={{ color: T.textDim }} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center py-1">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const dayCalls = callsByDay[day] || [];
              const isSelected = selectedDay === day;
              const isToday = day === 2; // March 2 = today
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className="relative min-h-[52px] rounded-sm p-1.5 flex flex-col items-center transition-all"
                  style={{
                    background: isSelected ? T.goldFaint : isToday ? T.raised : 'transparent',
                    border: `1px solid ${isSelected ? T.gold : isToday ? `${T.gold}30` : 'transparent'}`,
                  }}
                >
                  <span
                    className="text-[11px] font-black mb-1"
                    style={{ color: isSelected ? T.gold : isToday ? T.gold : T.textSub }}
                  >
                    {day}
                  </span>
                  {/* Call dots */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayCalls.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: c.completed ? T.textDim : TYPE_COLORS[c.type] }}
                      />
                    ))}
                    {dayCalls.length > 3 && (
                      <span className="text-[7px] font-black" style={{ color: T.textDim }}>+{dayCalls.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-5 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
            {(Object.keys(TYPE_COLORS) as CallType[]).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textDim }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Panel */}
        <div className="space-y-3">
          {/* Selected day calls */}
          <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>
                {selectedDay ? `March ${selectedDay}, 2026` : 'Select a Day'}
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: T.border }}>
              {selectedDayCalls.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs" style={{ color: T.textDim }}>No calls scheduled</p>
                </div>
              ) : (
                selectedDayCalls.map((call) => (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="w-full px-4 py-3 text-left transition-all"
                    style={{ borderBottom: `1px solid ${T.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = T.raised; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: call.completed ? T.textDim : TYPE_COLORS[call.type] }} />
                      <span className="text-xs font-black uppercase tracking-wide" style={{ color: call.completed ? T.textDim : T.text }}>{call.name}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-[9px]" style={{ color: T.gold }}>{call.time}</span>
                      <span className="text-[9px]" style={{ color: T.textDim }}>{call.duration}min</span>
                      <span className="text-[9px] uppercase tracking-wider" style={{ color: TYPE_COLORS[call.type] }}>{call.type.split(' ')[0]}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Upcoming calls list */}
          <div className="rounded-sm overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>Upcoming Calls</p>
            </div>
            <div>
              {MARCH_2026_CALLS.filter((c) => !c.completed && c.date >= 2).slice(0, 6).map((call) => (
                <button
                  key={call.id}
                  onClick={() => { setSelectedDay(call.date); setSelectedCall(call); }}
                  className="w-full px-4 py-2.5 text-left transition-all flex items-center gap-3"
                  style={{ borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.raised; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[call.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase truncate" style={{ color: T.text }}>{call.name}</p>
                    <p className="text-[9px]" style={{ color: T.textDim }}>Mar {call.date} · {call.time}</p>
                  </div>
                  {call.capitalInterest && (
                    <span className="text-[9px] font-black flex-shrink-0" style={{ color: T.gold }}>
                      ${(call.capitalInterest / 1000).toFixed(0)}K
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setSelectedCall(null)}
        >
          <div className="w-full max-w-md rounded-md overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: T.goldFaint }}>
                  <Phone size={14} style={{ color: T.gold }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: T.gold }}>Call Details</p>
                  <p className="text-[9px]" style={{ color: T.textDim }}>March {selectedCall.date}, 2026</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="w-7 h-7 rounded-sm flex items-center justify-center"
                style={{ background: T.raised }}
              >
                <X size={13} style={{ color: T.textDim }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: T.raised, border: `1px solid ${T.border}` }}>
                  <User size={16} style={{ color: T.textSub }} />
                </div>
                <div>
                  <p className="text-base font-black uppercase tracking-wide" style={{ color: T.text }}>{selectedCall.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: T.textDim }}>{selectedCall.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Date', value: `March ${selectedCall.date}, 2026` },
                  { label: 'Time', value: `${selectedCall.time} EST` },
                  { label: 'Duration', value: `${selectedCall.duration} minutes` },
                  { label: 'Status', value: selectedCall.completed ? 'Completed' : 'Upcoming' },
                ].map((row) => (
                  <div key={row.label} className="p-3 rounded-sm" style={{ background: T.raised, border: `1px solid ${T.border}` }}>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: T.textDim }}>{row.label}</p>
                    <p className="text-xs font-bold" style={{ color: row.label === 'Status' ? (selectedCall.completed ? T.jade : T.gold) : T.text }}>{row.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <Badge variant={TYPE_BADGE[selectedCall.type]} className="mb-3">{selectedCall.type}</Badge>
                {selectedCall.capitalInterest && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: T.textDim }}>Capital Interest:</span>
                    <span className="text-sm font-black" style={{ color: T.gold }}>${selectedCall.capitalInterest.toLocaleString()}</span>
                  </div>
                )}
                <div className="p-4 rounded-sm" style={{ background: T.raised, border: `1px solid ${T.border}` }}>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: T.textDim }}>Notes</p>
                  <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>{selectedCall.notes}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedCall(null)}>Close</Button>
                {!selectedCall.completed && (
                  <Button className="flex-1">
                    <Clock size={12} /> Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
