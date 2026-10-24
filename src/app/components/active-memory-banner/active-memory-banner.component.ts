import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PlannedMemory } from '@models/memoryInterface.model';
import { crewMemberToFriend } from '@models/userInterface.model';
import { FriendsProfilePicsComponent } from '../friends-profile-pics/friends-profile-pics.component';

const STORAGE_KEY = 'memorise.activeBanner.dismissed';
const DAY_MS = 86_400_000;

interface DismissedToday {
  date: string;
  ids: string[];
}

/** Whole-day index in local time, so DST changes never skew the day count. */
const dayIndex = (date: Date): number =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);

const todayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

/**
 * "Happening now" card for a memory that is currently running.
 * Tapping the card opens the memory; the button opens the add-photos page.
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

  readonly memory = input.required<PlannedMemory>();

  protected readonly crewAsFriends = computed(() => (this.memory().crew_members ?? []).map(crewMemberToFriend));

  /** "Day 3 of 7" plus a 0 to 1 fraction for the progress bar; null without dates. */
  protected readonly progress = computed(() => {
    const { memory_date: startDate, memory_end_date: endDate } = this.memory();
    if (!startDate || !endDate) {
      return null;
    }
    const start = dayIndex(new Date(startDate));
    const end = dayIndex(new Date(endDate));
    const total = Math.max(1, end - start + 1);
    const day = Math.min(Math.max(dayIndex(new Date()) - start + 1, 1), total);
    return { day, total, fraction: day / total };
  });

  protected readonly dateLabel = computed(() => {
    const { memory_date: startDate, memory_end_date: endDate } = this.memory();
    if (!startDate || !endDate) {
      return '';
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const fmt = (date: Date, format: string) => this.datePipe.transform(date, format) ?? '';

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();
    if (sameMonth && start.getDate() === end.getDate()) {
      return fmt(start, 'MMMM d, y');
    }
    if (sameMonth) {
      return `${fmt(start, 'MMMM d')}–${fmt(end, 'd')}, ${fmt(end, 'y')}`;
    }
    if (sameYear) {
      return `${fmt(start, 'MMM d')} – ${fmt(end, 'MMM d')}, ${fmt(end, 'y')}`;
    }
    return `${fmt(start, 'MMM d, y')} – ${fmt(end, 'MMM d, y')}`;
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