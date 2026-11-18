// pages/live-memory/live-memory.component.ts
import { Component, computed, DestroyRef, effect, inject, Injector, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MemoryService } from '@services/memory.service';
import { PlannedMemory } from '@models/memoryInterface.model';
import { NewPlanItem, NewPoll, PlanItem, POLL_QUESTIONS, PollCategory } from '@models/planItem.model';
import { BookingKind } from '@models/planBooking.model';
import { PHASE_LABELS, planPhase, todayIso, tripDay } from '@models/livePlan.model';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
import { BackButtonComponent } from '@components/back-button/back-button.component';
import { PlanBoardStore } from '../trip-workspace/plan-board.store';
import { PlanItemCardComponent } from '../trip-workspace/plan-item-card/plan-item-card.component';
import { PlanCommentsPanelComponent } from '../trip-workspace/plan-comments-panel/plan-comments-panel.component';
import { PlanItemDialogComponent, PlanItemDialogData } from '../trip-workspace/plan-item-dialog/plan-item-dialog.component';
import { PollDialogComponent, PollDialogData } from '../trip-workspace/polls/poll-dialog/poll-dialog.component';
import { BookingDialogComponent, BookingDialogData } from '../trip-workspace/bookings/booking-dialog/booking-dialog.component';
import { formatRange } from '../trip-workspace/date-finder/date-utils';
import { formatLocation } from '../trip-workspace/polls/location-utils';
import { ExpenseStore } from './expenses/expense.store';
import { ExpensesPanelComponent } from './expenses/expenses-panel/expenses-panel.component';
import { balanceText, openExpenseDialog } from './expenses/expense-utils';
import { QuickPollDialogComponent } from './quick-poll-dialog/quick-poll-dialog.component';
import { MemoryAddPhotosComponent } from '@components/memory-add-photos/memory-add-photos.component';

const LIVE_POLL_MS = 5_000;
enum Tab { Today, Polls, Expenses, Plan, Photos }

const EVENT_LABELS: Record<BookingKind, { start: string; end: string; startIcon: string; endIcon: string }> = {
  stay:      { start: 'Check-in',  end: 'Check-out', startIcon: 'login',          endIcon: 'logout' },
  transport: { start: 'Departure', end: 'Arrival',   startIcon: 'flight_takeoff', endIcon: 'flight_land' },
  activity:  { start: 'Starts',    end: 'Ends',      startIcon: 'play_circle',    endIcon: 'stop_circle' },
};

@Component({
  selector: 'app-live-memory',
  imports: [
    RouterLink, MatButtonModule, MatIconModule, MatTabsModule, MatBadgeModule, MatTooltipModule,
    LoadingSpinnerComponent, BackButtonComponent, MemoryAddPhotosComponent,
    PlanItemCardComponent, PlanCommentsPanelComponent, ExpensesPanelComponent,
  ],
  providers: [PlanBoardStore, ExpenseStore],
  templateUrl: './live-memory.component.html',
  styleUrl: './live-memory.component.scss',
})
export class LiveMemoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private memoryService = inject(MemoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private injector = inject(Injector);
  protected board = inject(PlanBoardStore);
  protected expenses = inject(ExpenseStore);

  readonly Tab = Tab;
  readonly memoryId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly plan = signal<PlannedMemory | null>(null);
  readonly isLoading = signal(true);
  readonly tab = signal<Tab>(Tab.Today);

  /** Re-evaluated every minute so "today" and closed polls stay correct. */
  private readonly now = signal(Date.now());
  readonly today = computed(() => {
    this.now();
    return todayIso();
  });

  readonly phase = computed(() => {
    const p = this.plan();
    return p ? planPhase(p.memory_date, p.memory_end_date, this.today()) : 'planning';
  });
  readonly phaseLabel = computed(() => PHASE_LABELS[this.phase()]);
  readonly day = computed(() => {
    const p = this.plan();
    return p?.memory_date && this.phase() === 'live' ? tripDay(p.memory_date, p.memory_end_date, this.today()) : null;
  });
  readonly dateLabel = computed(() => {
    const p = this.plan();
    return p?.memory_date ? formatRange(p.memory_date, p.memory_end_date) : '';
  });
  readonly destinationLabel = computed(() => formatLocation(this.plan()?.location ?? null));

  readonly todayEvents = computed(() => {
    const t = this.today();
    const list: { key: string; time: string; icon: string; label: string; item: PlanItem }[] = [];
    for (const item of this.board.activeItems()) {
      const b = item.booking;
      if (item.type !== 'booking' || !b || b.status === 'cancelled') continue;
      const meta = EVENT_LABELS[b.kind];
      if (b.starts_at?.startsWith(t)) {
        list.push({ key: `${item.item_id}s`, time: b.starts_at.slice(11, 16), icon: meta.startIcon, label: meta.start, item });
      }
      if (b.ends_at?.startsWith(t)) {
        list.push({ key: `${item.item_id}e`, time: b.ends_at.slice(11, 16), icon: meta.endIcon, label: meta.end, item });
      }
    }
    return list.sort((a, b) => a.time.localeCompare(b.time));
  });

  private isOpenPoll = (i: PlanItem, now: number) =>
    i.type === 'poll' && !!i.poll && i.poll.decided_option_id == null && !i.poll.is_closed
    && (!i.poll.closes_at || Date.parse(i.poll.closes_at) > now);

  readonly openPolls = computed(() => {
    const now = this.now();
    return this.board.activeItems().filter(i => this.isOpenPoll(i, now))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  });
  readonly otherPolls = computed(() => {
    const now = this.now();
    return this.board.activeItems().filter(i => i.type === 'poll' && !this.isOpenPoll(i, now))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  });
  readonly unvoted = computed(() => this.openPolls().filter(i => !i.poll!.my_votes.length).length);

  readonly bookings = computed(() => this.board.activeItems()
    .filter(i => i.type === 'booking')
    .sort((a, b) => (a.booking?.starts_at_utc ?? '9').localeCompare(b.booking?.starts_at_utc ?? '9')));
  readonly otherItems = computed(() => this.board.activeItems().filter(i => i.type !== 'booking' && i.type !== 'poll'));

  readonly balance = computed(() => balanceText(this.expenses.myNet(), this.expenses.base()));

  constructor() {
    effect(() => {
      const msg = this.board.error();
      if (msg) {
        this.snackBar.open(msg, 'Close', { duration: 3000 });
        this.board.error.set(null);
      }
    });
    effect(() => this.board.crew.set(this.plan()?.crew_members ?? []));
    effect(() => this.board.destination.set(this.plan()?.location ?? null));
    effect(() => this.board.hasDates.set(!!this.plan()?.memory_date));
    effect(() => {
      if (this.board.planVersion() > 0) untracked(() => void this.refreshPlan());
    });
    effect(() => {
      const events = this.board.remoteEvents();
      if (events.some(e => ['dates_set', 'dates_cleared', 'destination_set'].includes(e.action))) {
        untracked(() => void this.refreshPlan());
      }
    });

    const timer = setInterval(() => this.now.set(Date.now()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  async ngOnInit(): Promise<void> {
    this.board.setPollInterval(LIVE_POLL_MS);
    try {
      await Promise.all([
        this.loadPlan(),
        this.board.load(this.memoryId),
        this.expenses.load(this.memoryId),
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ---------- actions ----------

  openExpense(): void {
    openExpenseDialog(this.dialog, this.injector, { mode: 'create' });
  }

  openQuickPoll(): void {
    this.dialog
      .open<QuickPollDialogComponent, void, NewPoll>(QuickPollDialogComponent, {
        width: '520px', maxWidth: '95vw', maxHeight: '92vh', autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) void this.board.createPoll(result);
      });
  }

  openPollDialog(data: PollDialogData): void {
    this.dialog
      .open<PollDialogComponent, PollDialogData, NewPoll>(PollDialogComponent, {
        width: '600px', maxWidth: '95vw', maxHeight: '92vh', autoFocus: false, injector: this.injector, data,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) void this.board.createPoll(result);
      });
  }

  editItem(item: PlanItem): void {
    if (item.type === 'poll') {
      this.openPollDialog({ mode: 'edit', itemId: item.item_id });
      return;
    }
    if (item.type === 'booking') {
      this.dialog.open<BookingDialogComponent, BookingDialogData, boolean>(BookingDialogComponent, {
        width: '680px', maxWidth: '95vw', maxHeight: '92vh', autoFocus: false, injector: this.injector,
        data: { mode: 'edit', itemId: item.item_id },
      });
      return;
    }
    this.dialog
      .open<PlanItemDialogComponent, PlanItemDialogData, NewPlanItem>(PlanItemDialogComponent, {
        width: '520px', maxWidth: '95vw', injector: this.injector, data: { item },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) void this.board.update(item.item_id, result);
      });
  }

  promote(idea: PlanItem): void {
    const category: PollCategory = idea.category === 'dates' ? 'other' : idea.category;
    this.openPollDialog({
      mode: 'create',
      draft: {
        title: POLL_QUESTIONS[category], description: idea.description, category,
        options: [idea.title], sourceItemId: idea.item_id,
      },
    });
  }

  onUploadStarted(count: number): void {
    this.snackBar.open(`${count} photo${count === 1 ? '' : 's'} uploading in the background`, 'OK', { duration: 3000 });
  }

  // ---------- loading ----------

  private async loadPlan(): Promise<void> {
    try {
      this.plan.set(await firstValueFrom(this.memoryService.getMemoryToPlan(this.memoryId)));
    } catch (err) {
      console.error('Failed to load trip:', err);
    }
  }

  private async refreshPlan(): Promise<void> {
    try {
      this.plan.set(await firstValueFrom(this.memoryService.getMemoryToPlan(this.memoryId)));
    } catch (err) {
      console.warn('Trip refresh failed:', err);
    }
  }
}
