import { addDays, diffDays } from './date-utils';

export interface Responder {
  userId: string;
  yes: ReadonlySet<string>;
  maybe: ReadonlySet<string>;
}

export interface SuggestionInput {
  rangeStart: string;
  rangeEnd: string;
  minDays: number;
  maxDays: number;
  today: string;
  responders: Responder[];
}

export interface DateSuggestion {
  key: string;
  start: string;
  end: string;
  days: number;
  available: string[];                                     // every day "yes"
  ifNeeded: string[];                                      // every day yes/maybe, ≥1 maybe
  unavailable: { userId: string; conflictDays: number }[];
}

interface Candidate { s: number; len: number; going: number; allYes: number; maybeDays: number; }

export function suggestWindows(input: SuggestionInput, limit = 5): DateSuggestion[] {
  const { responders } = input;
  const from = input.rangeStart > input.today ? input.rangeStart : input.today;
  const n = diffDays(from, input.rangeEnd) + 1;
  const minLen = Math.max(1, input.minDays);
  const maxLen = Math.min(input.maxDays, n);
  if (responders.length === 0 || n < minLen) return [];

  const days = Array.from({ length: n }, (_, i) => addDays(from, i));

  // Per responder: prefix sums of "yes" days and "no" days (unmarked = no once responded)
  const sums = responders.map(r => {
    const yes = new Uint16Array(n + 1);
    const no = new Uint16Array(n + 1);
    days.forEach((d, i) => {
      yes[i + 1] = yes[i] + (r.yes.has(d) ? 1 : 0);
      no[i + 1] = no[i] + (r.yes.has(d) || r.maybe.has(d) ? 0 : 1);
    });
    return { yes, no };
  });

  const candidates: Candidate[] = [];
  for (let len = minLen; len <= maxLen; len++) {
    for (let s = 0; s + len <= n; s++) {
      let going = 0, allYes = 0, maybeDays = 0;
      for (const p of sums) {
        if (p.no[s + len] - p.no[s] > 0) continue;
        const yes = p.yes[s + len] - p.yes[s];
        going++;
        if (yes === len) allYes++;
        maybeDays += len - yes;
      }
      if (going > 0) candidates.push({ s, len, going, allYes, maybeDays });
    }
  }

  candidates.sort((a, b) =>
    b.going - a.going || b.allYes - a.allYes || b.len - a.len || a.maybeDays - b.maybeDays || a.s - b.s);

  // Greedy: skip windows overlapping a better one → real alternatives
  const picked: Candidate[] = [];
  for (const c of candidates) {
    if (picked.some(p => c.s < p.s + p.len && p.s < c.s + c.len)) continue;
    picked.push(c);
    if (picked.length === limit) break;
  }

  return picked.map(c => {
    const available: string[] = [];
    const ifNeeded: string[] = [];
    const unavailable: DateSuggestion['unavailable'] = [];
    responders.forEach((r, i) => {
      const no = sums[i].no[c.s + c.len] - sums[i].no[c.s];
      const yes = sums[i].yes[c.s + c.len] - sums[i].yes[c.s];
      if (no > 0) unavailable.push({ userId: r.userId, conflictDays: no });
      else if (yes === c.len) available.push(r.userId);
      else ifNeeded.push(r.userId);
    });
    const start = days[c.s];
    const end = days[c.s + c.len - 1];
    return { key: `${start}/${end}`, start, end, days: c.len, available, ifNeeded, unavailable };
  });
}