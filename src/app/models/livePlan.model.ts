// @models/livePlan.model.ts
import { BookingKind, TransportMode } from '@models/planBooking.model';
import { PlanSummaryCrewMember } from '@models/planSummary.model';

// ---------- phases (mirror of backend components/plan-shared/phase.js) ----------

export type PlanPhase = 'planning' | 'upcoming' | 'live' | 'wrapping_up' | 'archived';
export const WRAP_UP_DAYS = 7;

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
const utcMs = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);

/** The browser's calendar day ("today" decision: browser time zone). */
export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDaysIso(iso: string, n: number): string {
  return new Date(utcMs(iso) + n * DAY_MS).toISOString().slice(0, 10);
}

export function planPhase(start: string | null | undefined, end: string | null | undefined, today = todayIso()): PlanPhase {
  if (!start) return 'planning';
  const s = start.slice(0, 10);
  const e = (end || start).slice(0, 10);
  if (today < s) return 'upcoming';
  if (today <= e) return 'live';
  return today <= addDaysIso(e, WRAP_UP_DAYS) ? 'wrapping_up' : 'archived';
}

/** Day x of y while the trip runs (clamped to the trip). */
export function tripDay(start: string, end: string | null | undefined, today = todayIso()): { day: number; total: number } {
  const s = start.slice(0, 10);
  const e = (end || start).slice(0, 10);
  const total = Math.max(1, Math.round((utcMs(e) - utcMs(s)) / DAY_MS) + 1);
  const day = Math.min(Math.max(Math.round((utcMs(today) - utcMs(s)) / DAY_MS) + 1, 1), total);
  return { day, total };
}

export const PHASE_LABELS: Record<PlanPhase, string> = {
  planning: 'Planning',
  upcoming: 'Upcoming',
  live: 'Live',
  wrapping_up: 'Wrapping up',
  archived: 'Archived',
};

// ---------- live memories (GET /api/live) ----------

export interface LiveTodayEvent {
  item_id: number;
  title: string;
  kind: BookingKind;
  transport_mode: TransportMode | null;
  type: 'start' | 'end';
  at: string;            // local "YYYY-MM-DDTHH:mm"
  tz: string | null;
}

export interface BalanceSummary {
  base: string;
  myNet: number | null;  // cents in base currency; null = a rate is missing
  totalSpent: number | null;
  missingRates: string[];
  expenseCount: number;
}

export interface LiveMemory {
  memory_id: string;
  title: string;
  title_pic: string | null;
  memory_date: string;
  memory_end_date: string | null;
  phase: 'live';
  is_owner: boolean;
  location: { city: string; country: string } | null;
  crew_members: PlanSummaryCrewMember[];
  today: {
    date: string;
    day: number;
    total: number;
    events: LiveTodayEvent[];
    open_polls: number;
    unvoted_polls: number;
  };
  expenses: BalanceSummary;
}

// ---------- expenses ----------

export type ExpenseCategory = 'food' | 'transport' | 'stay' | 'activity' | 'other';

export const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: string }[] = [
  { key: 'food',      label: 'Food & drinks', icon: 'restaurant' },
  { key: 'transport', label: 'Transport',     icon: 'commute' },
  { key: 'stay',      label: 'Stay',          icon: 'hotel' },
  { key: 'activity',  label: 'Activities',    icon: 'local_activity' },
  { key: 'other',     label: 'Other',         icon: 'receipt_long' },
];
export const EXPENSE_CATEGORY_META = Object.fromEntries(EXPENSE_CATEGORIES.map(c => [c.key, c])) as
  Record<ExpenseCategory, { key: ExpenseCategory; label: string; icon: string }>;

/** "u:<userId>" or "p:<placeholderId>" */
export type ParticipantKey = string;

export interface LedgerParticipant {
  key: ParticipantKey;
  type: 'user' | 'placeholder';
  id: string;
  name: string;
  avatar: string | null;
  isPlaceholder: boolean;
  isCreator: boolean;
  isCurrent: boolean;    // false = left the crew but appears in old expenses
}

export interface ExpenseShare { participant: ParticipantKey; cents: number; }

export interface Expense {
  expense_id: number;
  title: string;
  category: ExpenseCategory;
  amount_cents: number;
  currency: string;
  paid_by: ParticipantKey;
  spent_on: string;
  split_mode: 'equal' | 'custom';
  notes: string | null;
  source_booking_id: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  shares: ExpenseShare[];
}

export interface Balances {
  base: string;
  byCurrency: Record<string, Record<ParticipantKey, number>>;
  converted: Record<ParticipantKey, number> | null;
  missingRates: string[];
  totals: Record<string, number>;
  totalConverted: number | null;
}

export interface BookingSuggestion {
  item_id: number;
  title: string;
  kind: BookingKind;
  price_cents: number;
  currency: string;
  paid_by: ParticipantKey;
}

export interface Ledger {
  participants: LedgerParticipant[];
  expenses: Expense[];
  balances: Balances;
  currency: { base: string; rates: Record<string, number> };
  bookingSuggestions: BookingSuggestion[];
  viewer: { key: ParticipantKey; userId: string; isOwner: boolean };
}

export type ExpenseSplit =
  | { mode: 'equal'; participants: ParticipantKey[] }
  | { mode: 'custom'; shares: { participant: ParticipantKey; amountCents: number }[] };

export interface ExpenseInput {
  title: string;
  category?: ExpenseCategory;
  amountCents: number;
  currency: string;
  paidBy: ParticipantKey;
  spentOn?: string;
  split: ExpenseSplit;
  notes?: string | null;
}

export interface CurrencyInput {
  baseCurrency?: string;
  rates?: Record<string, number>;
}
