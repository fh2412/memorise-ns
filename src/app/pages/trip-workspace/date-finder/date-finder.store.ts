import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DateFinderService } from '@services/date-finder.service';
import {
  DateFinderSettings, DateFinderSettingsInput, DayHeat, DayState, MemberAvailability,
} from '@models/dateFinder.model';
import { PlanBoardStore } from '../plan-board.store';
import { Responder, suggestWindows } from './date-finder.algo';
import { addDays, todayIso } from './date-utils';

const SAVE_DEBOUNCE_MS = 800;
const DEFAULT_WINDOW_DAYS = 90;
const REFRESH_ACTIONS = new Set(['availability_updated', 'date_finder_updated']);

export type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

function defaultSettings(): DateFinderSettings {
  const today = todayIso();
  return { range_start: today, range_end: addDays(today, DEFAULT_WINDOW_DAYS - 1), min_days: 2, max_days: 7 };
}

function toMarkMap(a?: MemberAvailability): Map<string, DayState> {
  const map = new Map<string, DayState>();
  a?.yes.forEach(d => map.set(d, 'yes'));
  a?.maybe.forEach(d => map.set(d, 'maybe'));
  return map;
}

@Injectable()
export class DateFinderStore {
  private api = inject(DateFinderService);
  private board = inject(PlanBoardStore);

  private memoryId = '';
  private myId: string | null = null;

  readonly isLoading = signal(false);
  readonly loaded = signal(false);
  readonly members = signal<string[]>([]);
  private readonly serverSettings = signal<DateFinderSettings | null>(null);
  private readonly fallbackSettings = signal(defaultSettings());
  private readonly others = signal<MemberAvailability[]>([]);
  readonly myMarks = signal<ReadonlyMap<string, DayState>>(new Map());
  readonly iResponded = signal(false);
  readonly saveState = signal<SaveState>('idle');

  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private saving = false;
  private saveAgain = false;

  readonly settings = computed(() => this.serverSettings() ?? this.fallbackSettings());
  readonly isConfigured = computed(() => this.serverSettings() !== null);

  /** Current crew members who responded; my own entry comes from local (unsaved) state. */
  readonly responders = computed<Responder[]>(() => {
    const members = new Set(this.members());
    const list: Responder[] = this.others()
      .filter(a => members.has(a.user_id))
      .map(a => ({ userId: a.user_id, yes: new Set(a.yes), maybe: new Set(a.maybe) }));

    if (this.myId && this.iResponded()) {
      const yes = new Set<string>();
      const maybe = new Set<string>();
      for (const [day, state] of this.myMarks()) (state === 'yes' ? yes : maybe).add(day);
      list.push({ userId: this.myId, yes, maybe });
    }
    return list;
  });

  readonly waitingFor = computed(() => {
    const responded = new Set(this.responders().map(r => r.userId));
    return this.members().filter(id => !responded.has(id));
  });

  readonly heat = computed<ReadonlyMap<string, DayHeat>>(() => {
    const map = new Map<string, DayHeat>();
    const entry = (day: string) => {
      let h = map.get(day);
      if (!h) map.set(day, (h = { yes: [], maybe: [] }));
      return h;
    };
    for (const r of this.responders()) {
      r.yes.forEach(d => entry(d).yes.push(r.userId));
      r.maybe.forEach(d => entry(d).maybe.push(r.userId));
    }
    return map;
  });

  readonly suggestions = computed(() => {
    const s = this.settings();
    return suggestWindows({
      rangeStart: s.range_start,
      rangeEnd: s.range_end,
      minDays: s.min_days,
      maxDays: s.max_days,
      today: todayIso(),
      responders: this.responders(),
    });
  });

  constructor() {
    // Reload when someone else changed availability or the search settings
    effect(() => {
      const events = this.board.remoteEvents();
      if (!untracked(this.loaded)) return;
      if (events.some(e => REFRESH_ACTIONS.has(e.action))) {
        untracked(() => void this.fetch().catch(err => console.warn('Availability refresh failed:', err)));
      }
    });
    inject(DestroyRef).onDestroy(() => this.flush());
  }

  async open(memoryId: string, myId: string | null): Promise<void> {
    if (this.loaded() && this.memoryId === memoryId) {
      void this.fetch().catch(err => console.warn('Availability refresh failed:', err));
      return;
    }
    this.memoryId = memoryId;
    this.myId = myId;
    this.isLoading.set(true);
    try {
      await this.fetch();
      this.loaded.set(true);
    } catch (err) {
      console.error('Failed to load availability:', err);
      this.board.error.set('Could not load availability');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ---------- my availability ----------

  setDay(day: string, state: DayState | null): void {
    this.myMarks.update(prev => {
      const next = new Map(prev);
      if (state) next.set(day, state);
      else next.delete(day);
      return next;
    });
    this.iResponded.set(true);
    this.scheduleSave();
  }

  clearMine(): void {
    this.myMarks.set(new Map());
    this.iResponded.set(true); // "I can't make any of these days" is a valid answer
    this.scheduleSave();
  }

  retrySave(): void {
    this.scheduleSave(0);
  }

  // ---------- settings (owner) ----------

  async saveSettings(input: DateFinderSettingsInput): Promise<boolean> {
    try {
      this.serverSettings.set(await firstValueFrom(this.api.saveSettings(this.memoryId, input)));
      this.board.syncNow();
      return true;
    } catch (err) {
      console.error('Failed to save date search settings:', err);
      this.board.error.set(err instanceof HttpErrorResponse && err.status === 403
        ? 'Only the plan owner can change the date search'
        : 'Could not save the date search');
      return false;
    }
  }

  // ---------- internals ----------

  private async fetch(): Promise<void> {
    const data = await firstValueFrom(this.api.get(this.memoryId));
    this.serverSettings.set(data.settings);
    this.members.set(data.members);
    this.others.set(data.availability.filter(a => a.user_id !== this.myId));

    // Never overwrite marks the user is currently painting
    if (this.saveTimer === null && !this.saving) {
      const mine = data.availability.find(a => a.user_id === this.myId);
      this.iResponded.set(!!mine);
      this.myMarks.set(toMarkMap(mine));
    }
  }

  private scheduleSave(delay = SAVE_DEBOUNCE_MS): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveState.set('pending');
    this.saveTimer = setTimeout(() => void this.save(), delay);
  }

  flush(): void {
    if (!this.saveTimer) return;
    clearTimeout(this.saveTimer);
    void this.save();
  }

  private async save(): Promise<void> {
    this.saveTimer = null;
    if (this.saving) {
      this.saveAgain = true;
      return;
    }
    this.saving = true;
    this.saveState.set('saving');

    // Only send days inside the current search window (also keeps the payload under the backend cap)
    const { range_start, range_end } = this.settings();
    const today = todayIso();
    const from = range_start > today ? range_start : today;
    const yes: string[] = [];
    const maybe: string[] = [];
    for (const [day, state] of this.myMarks()) {
      if (day < from || day > range_end) continue;
      (state === 'yes' ? yes : maybe).push(day);
    }

    try {
      await firstValueFrom(this.api.saveMine(this.memoryId, { yes, maybe }));
      if (!this.saveAgain && !this.saveTimer) this.saveState.set('saved');
      this.board.syncNow();
    } catch (err) {
      console.error('Failed to save availability:', err);
      this.saveState.set('error');
    } finally {
      this.saving = false;
      if (this.saveAgain) {
        this.saveAgain = false;
        void this.save();
      }
    }
  }
}