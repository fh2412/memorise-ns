// @components/active-memory-banner/active-memory-banner.component.ts  (full replacement)
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LiveMemory } from '@models/livePlan.model';
import { CrewMember, crewMemberToFriend } from '@models/userInterface.model';
import { FriendsProfilePicsComponent } from '../friends-profile-pics/friends-profile-pics.component';

const STORAGE_KEY = 'memorise.activeBanner.dismissed';

interface DismissedToday {
  date: string;
  ids: string[];
}

const todayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

/** "YYYY-MM-DD" as a LOCAL date (new Date('YYYY-MM-DD') would be UTC midnight). */
const localDate = (iso: string): Date => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

const money = (cents: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};

const EVENT_VERB: Record<string, { start: string; end: string }> = {
  stay: { start: 'Check-in', end: 'Check-out' },
  transport: { start: 'Departure', end: 'Arrival' },
  activity: { start: 'Starts', end: 'Ends' },
};

/**
 * "Happening now" card for a live memory.
 * Tapping the card opens the live view; the camera button opens the add-photos page.
 * "Not today" hides it until tomorrow (stored per memory, per day).
 */
@Component({
  selector: 'app-active-memory-banner',
  templateUrl: './active-memory-banner.component.html',
  styleUrl: './active-memory-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
  imports: [RouterLink, MatButton, MatIconButton, MatIcon, FriendsProfilePicsComponent],
})
export class ActiveMemoryBannerComponent {
  private readonly datePipe = inject(DatePipe);

  readonly memory = input.required<LiveMemory>();

  /** The live endpoint sends a lean crew – fill the remaining CrewMember fields with neutral values. */
  protected readonly crewAsFriends = computed(() =>
    this.memory().crew_members
      .filter(m => !m.isPlaceholder)
      .map(m => crewMemberToFriend({
        user_id: m.user_id,
        name: m.name,
        profilepic_thumb: m.profilepic_thumb,
        profilepic: null,
        country: null,
        dob: null,
        gender: '',
        email: '',
        status: 'online',
        sharedMemoriesCount: 0,
        isCreator: m.isCreator,
      } satisfies CrewMember)));

  protected readonly progress = computed(() => {
    const { day, total } = this.memory().today;
    return { day, total, fraction: day / Math.max(1, total) };
  });

  protected readonly dateLabel = computed(() => {
    const { memory_date: startDate, memory_end_date: endDate } = this.memory();
    if (!startDate) return '';
    const start = localDate(startDate);
    const end = localDate(endDate ?? startDate);
    const fmt = (date: Date, format: string) => this.datePipe.transform(date, format) ?? '';

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();
    if (sameMonth && start.getDate() === end.getDate()) return fmt(start, 'MMMM d, y');
    if (sameMonth) return `${fmt(start, 'MMMM d')}–${fmt(end, 'd')}, ${fmt(end, 'y')}`;
    if (sameYear) return `${fmt(start, 'MMM d')} – ${fmt(end, 'MMM d')}, ${fmt(end, 'y')}`;
    return `${fmt(start, 'MMM d, y')} – ${fmt(end, 'MMM d, y')}`;
  });

  /** Up to two of today's booking events, e.g. "Check-out 10:00 · Hotel Adria". */
  protected readonly todayLines = computed(() =>
    this.memory().today.events.slice(0, 2).map(e => {
      const verb = EVENT_VERB[e.kind] ?? EVENT_VERB['activity'];
      return `${e.type === 'start' ? verb.start : verb.end} ${e.at.slice(11, 16)} · ${e.title}`;
    }));

  protected readonly pollsLabel = computed(() => {
    const { open_polls: open, unvoted_polls: unvoted } = this.memory().today;
    if (unvoted) return unvoted === 1 ? '1 poll needs your vote' : `${unvoted} polls need your vote`;
    if (open) return open === 1 ? '1 open poll' : `${open} open polls`;
    return null;
  });

  protected readonly balanceLabel = computed(() => {
    const e = this.memory().expenses;
    if (!e.expenseCount || e.myNet === null) return null;
    if (e.myNet > 0) return `You get back ${money(e.myNet, e.base)}`;
    if (e.myNet < 0) return `You owe ${money(-e.myNet, e.base)}`;
    return 'All square';
  });

  private readonly dismissedIds = signal<string[]>(this.readDismissed());
  protected readonly isDismissed = computed(() => this.dismissedIds().includes(this.memory().memory_id));

  protected dismiss(): void {
    const ids = [...this.dismissedIds(), this.memory().memory_id];
    this.dismissedIds.set(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), ids } satisfies DismissedToday));
    } catch {
      // Storage can be unavailable (private mode); the banner just returns on reload.
    }
  }

  private readDismissed(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? (JSON.parse(raw) as DismissedToday) : null;
      return stored?.date === todayKey() ? stored.ids : [];
    } catch {
      return [];
    }
  }
}
