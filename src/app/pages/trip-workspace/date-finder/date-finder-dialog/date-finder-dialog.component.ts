import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { MemoryService } from '@services/memory.service';
import { CrewMember } from '@models/userInterface.model';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
import { PlanBoardStore } from '../../plan-board.store';
import { DateFinderStore } from '../date-finder.store';
import { DateSuggestion } from '../date-finder.algo';
import { diffDays, formatRange, todayIso } from '../date-utils';
import { AvailabilityCalendarComponent, Brush } from '../availability-calendar/availability-calendar.component';

export interface DateFinderDialogData {
  memoryId: string;
  myId: string | null;
  isOwner: boolean;
  crew: CrewMember[];
  lockedStart: string | null;
  lockedEnd: string | null;
}

export interface DateFinderDialogResult {
  startDate: string | null;
  endDate: string | null;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

@Component({
  selector: 'app-date-finder-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatButtonToggleModule,
    MatFormFieldModule, MatInputModule, MatIconModule, LoadingSpinnerComponent, AvailabilityCalendarComponent,
  ],
  templateUrl: './date-finder-dialog.component.html',
  styleUrl: './date-finder-dialog.component.scss',
})
export class DateFinderDialogComponent implements OnInit, OnDestroy {
  readonly data = inject<DateFinderDialogData>(MAT_DIALOG_DATA);
  readonly store = inject(DateFinderStore);
  private dialogRef = inject<MatDialogRef<DateFinderDialogComponent, DateFinderDialogResult>>(MatDialogRef);
  private memoryService = inject(MemoryService);
  private board = inject(PlanBoardStore);
  private fb = inject(NonNullableFormBuilder);

  readonly formatRange = formatRange;
  readonly lockedLabel = this.data.lockedStart ? formatRange(this.data.lockedStart, this.data.lockedEnd) : null;

  readonly tab = signal<'mine' | 'group'>('mine');
  readonly brush = signal<Brush>('yes');
  readonly selectedKey = signal<string | null>(null);
  readonly confirmKey = signal<string | null>(null);
  readonly locking = signal(false);
  readonly showSettings = signal(false);
  readonly settingsError = signal<string | null>(null);

  readonly settingsForm = this.fb.group({
    rangeStart: [''],
    rangeEnd: [''],
    minDays: [2],
    maxDays: [7],
  });

  /** Registered crew only – placeholders have no account and can't mark availability. */
  readonly names = computed(() => {
    const map = new Map<string, string>();
    for (const m of this.data.crew) if (!m.isPlaceholder) map.set(m.user_id, m.name);
    if (this.data.myId) map.set(this.data.myId, 'You');
    return map;
  });

  readonly searchLabel = computed(() => {
    const s = this.store.settings();
    const len = s.min_days === s.max_days ? `${s.min_days} days` : `${s.min_days}–${s.max_days} days`;
    return `${formatRange(s.range_start, s.range_end)} · ${len}`;
  });

  readonly selected = computed<DateSuggestion | null>(() => {
    const list = this.store.suggestions();
    return list.find(s => s.key === this.selectedKey()) ?? list[0] ?? null;
  });

  readonly highlight = computed(() => {
    const s = this.selected();
    return s ? { start: s.start, end: s.end } : null;
  });

  readonly waitingNames = computed(() => this.store.waitingFor().map(id => this.nameOf(id)).join(', '));

  ngOnInit(): void {
    void this.store.open(this.data.memoryId, this.data.myId);
  }

  ngOnDestroy(): void {
    this.store.flush();
  }

  nameOf(id: string): string {
    return this.names().get(id) ?? 'Former member';
  }

  select(s: DateSuggestion): void {
    this.selectedKey.set(s.key);
    this.confirmKey.set(null);
    this.tab.set('group');
  }

  toggleSettings(): void {
    if (this.showSettings()) {
      this.showSettings.set(false);
      return;
    }
    const s = this.store.settings();
    this.settingsForm.setValue({
      rangeStart: s.range_start, rangeEnd: s.range_end, minDays: s.min_days, maxDays: s.max_days,
    });
    this.settingsError.set(null);
    this.showSettings.set(true);
  }

  async saveSettings(): Promise<void> {
    const v = this.settingsForm.getRawValue();
    const error = validateSettings(v);
    this.settingsError.set(error);
    if (error) return;
    const ok = await this.store.saveSettings({
      rangeStart: v.rangeStart, rangeEnd: v.rangeEnd, minDays: Number(v.minDays), maxDays: Number(v.maxDays),
    });
    if (ok) this.showSettings.set(false);
  }

  /** First click arms, second click locks. */
  async lock(s: DateSuggestion): Promise<void> {
    if (this.confirmKey() !== s.key) {
      this.confirmKey.set(s.key);
      return;
    }
    await this.setDates(s.start, s.end);
  }

  reopen(): Promise<void> {
    return this.setDates(null, null);
  }

  private async setDates(start: string | null, end: string | null): Promise<void> {
    this.locking.set(true);
    try {
      const res = await firstValueFrom(this.memoryService.updateMemoryDates(this.data.memoryId, start, end));
      this.board.syncNow();
      this.dialogRef.close({ startDate: res.startDate, endDate: res.endDate });
    } catch (err) {
      console.error('Failed to set dates:', err);
      this.board.error.set(err instanceof HttpErrorResponse && err.status === 403
        ? 'Only the plan owner can set the dates'
        : 'Could not save the dates');
    } finally {
      this.locking.set(false);
    }
  }
}

function validateSettings(v: { rangeStart: string; rangeEnd: string; minDays: number; maxDays: number }): string | null {
  if (!ISO.test(v.rangeStart) || !ISO.test(v.rangeEnd)) return 'Please pick an earliest start and a latest end.';
  if (v.rangeEnd < v.rangeStart) return 'The latest end must not be before the earliest start.';
  if (v.rangeEnd < todayIso()) return 'The search range has to reach into the future.';
  if (diffDays(v.rangeStart, v.rangeEnd) + 1 > 366) return 'The search range may span at most one year.';
  const min = Number(v.minDays);
  const max = Number(v.maxDays);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max > 30) {
    return 'Trip length must be between 1 and 30 days.';
  }
  if (min > max) return 'The minimum length must not exceed the maximum.';
  return null;
}