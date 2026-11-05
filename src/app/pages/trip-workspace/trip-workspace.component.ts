import { Component, effect, inject, Injector, OnInit, signal, untracked } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@services/userService';
import { firstValueFrom } from 'rxjs';
import { MemoryService } from '@services/memory.service';
import { PlannedMemory } from '@models/memoryInterface.model';
import { LoadingSpinnerComponent } from "@components/loading-spinner/loading-spinner.component";
import { FormsModule } from '@angular/forms';
import { TripWsHeaderComponent } from "./trip-ws-header/trip-ws-header.component";
import { CrewMember } from '@models/userInterface.model';
import { AddCrewDialogComponent } from './trip-ws-header/add-crew-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CorkboardViewComponent } from './corkboard-view/corkboard-view.component';
import { StructuredViewComponent } from './structured-view/structured-view.component';
import { PlanBoardStore } from './plan-board.store';
import { PlanItem, NewPlanItem, NewPoll, POLL_QUESTIONS, PollCategory } from '@models/planItem.model';
import { PlanItemDialogComponent, PlanItemDialogData } from './plan-item-dialog/plan-item-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PlanActivityFeedComponent } from './plan-activity-feed/plan-activity-feed.component';
import { DateFinderDialogComponent, DateFinderDialogData, DateFinderDialogResult } from './date-finder/date-finder-dialog/date-finder-dialog.component';
import { DateFinderStore } from './date-finder/date-finder.store';
import { MatMenuModule } from '@angular/material/menu';
import { PollDialogData, PollDialogComponent } from './polls/poll-dialog/poll-dialog.component';
import { PlanProgressStripComponent } from './plan-progress-strip/plan-progress-strip.component';
import { ManualMilestoneKey } from '@models/planProgress.model';
import { PlanCommentsPanelComponent } from './plan-comments-panel/plan-comments-panel.component';
import { BookingDialogComponent, BookingDialogData } from './bookings/booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-trip-workspace',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    LoadingSpinnerComponent,
    NgClass,
    TripWsHeaderComponent,
    CorkboardViewComponent,
    StructuredViewComponent,
    MatTabsModule,
    PlanActivityFeedComponent,
    MatMenuModule,
    PlanProgressStripComponent,
    PlanCommentsPanelComponent,
  ],
  providers: [PlanBoardStore, DateFinderStore],
  templateUrl: './trip-workspace.component.html',
  styleUrls: ['./trip-workspace.component.scss']
})
export class TripWorkspaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private memoryService = inject(MemoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private injector = inject(Injector);

  // Signal to track the current board view mode
  currentView = signal<'corkboard' | 'structured'>('corkboard');
  sidebarTab = signal(0); // 0 = Crew, 1 = Activity


  loggedInUserId: string | null = null;
  memoryId = '';
  isLoading = signal<boolean>(true);
  plannedMemory = signal<PlannedMemory | undefined>(undefined);
  crew = signal<CrewMember[]>([]); // Initialize without undefined to prevent errors
  shareToken?: string;

  protected board = inject(PlanBoardStore);

  constructor() {
    effect(() => {
      const msg = this.board.error();
      if (msg) {
        this.snackBar.open(msg, 'Close', { duration: 3000 });
        this.board.error.set(null);
      }
    });

    // While the Activity tab is open, everything arriving counts as seen
    effect(() => {
      this.board.events();
      if (this.sidebarTab() === 1) this.board.markEventsSeen();
    });

    effect(() => {
      const events = this.board.remoteEvents();
      if (events.some(e => e.action === 'dates_set' || e.action === 'dates_cleared')) {
        untracked(() => void this.refreshPlan());
      }
    });

    effect(() => this.board.crew.set(this.crew()));
    effect(() => this.board.destination.set(this.plannedMemory()?.location ?? null))

    // My own destination change → reload the header
    effect(() => {
      if (this.board.planVersion() > 0) untracked(() => void this.refreshPlan());
    });

    // Replace the existing remote-dates effect with this one (adds destination_set)
    effect(() => {
      const events = this.board.remoteEvents();
      if (events.some(e => ['dates_set', 'dates_cleared', 'destination_set'].includes(e.action))) {
        untracked(() => void this.refreshPlan());
      }
    });

    effect(() => this.board.hasDates.set(!!this.plannedMemory()?.memory_date));
  }

  async ngOnInit(): Promise<void> {
    this.memoryId = this.route.snapshot.paramMap.get('memoryId') || '';
    this.loggedInUserId = this.userService.getLoggedInUserId();
    try {
      await Promise.all([this.loadMemoriesPage(), this.board.load(this.memoryId)]);
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  openItemDialog(item?: PlanItem): void {
    if (item?.type === 'poll') {
      this.openPollDialog({ mode: 'edit', itemId: item.item_id });
      return;
    }
    if (item?.type === 'booking') {
      this.openBookingDialog({ mode: 'edit', itemId: item.item_id });
      return;
    }
    this.dialog
      .open<PlanItemDialogComponent, PlanItemDialogData, NewPlanItem>(PlanItemDialogComponent, {
        width: '520px',
        maxWidth: '90vw',
        injector: this.injector,
        data: { item },
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (item) void this.board.update(item.item_id, result);
        else void this.board.create(result);
      });
  }

  openPollDialog(data: PollDialogData): void {
    this.dialog
      .open<PollDialogComponent, PollDialogData, NewPoll>(PollDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        autoFocus: false,
        injector: this.injector, // dialog needs PlanBoardStore
        data,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) void this.board.createPoll(result);
      });
  }

  openBookingDialog(data: BookingDialogData): void {
    this.dialog.open<BookingDialogComponent, BookingDialogData, boolean>(BookingDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      autoFocus: false,
      injector: this.injector, // dialog needs PlanBoardStore
      data,
    });
  }

  private async loadMemoriesPage(): Promise<void> {
    this.isLoading.set(true);

    if (this.loggedInUserId) {
      try {
        const result = await firstValueFrom(
          this.memoryService.getMemoryToPlan(this.memoryId)
        );
        this.plannedMemory.set(result);
        this.crew.set(result.crew_members || []);
      } catch (error) {
        console.error('Error loading planned memories:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  handleTitleUpdate(event: { memoryId: string; title: string }) {
    this.plannedMemory.update(plan => plan ? { ...plan, title: event.title } : plan);

    this.memoryService.updateMemoryTitle(event.memoryId, event.title).subscribe({
      error: (err) => {
        console.error('Failed to save title backend side:', err);
      }
    });
  }

  addCrewMember() {
    const previousCrew = this.crew();

    const dialogRef = this.dialog.open(AddCrewDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { currentCrew: previousCrew }
    });

    dialogRef.afterClosed().subscribe(async (updatedCrew: CrewMember[]) => {
      if (updatedCrew) {
        // Optimistically update local UI state
        this.crew.set(updatedCrew);
        console.log("Updated Crew: ", updatedCrew);

        try {
          await firstValueFrom(
            this.memoryService.syncMemoryCrew(this.memoryId, previousCrew, updatedCrew)
          );
        } catch (error) {
          console.error('Failed to sync crew updates:', error);
          // Rollback state if desired
          this.crew.set(previousCrew);
        }
      }
    });
  }

  async shareInviteLink(event: MouseEvent): Promise<void> {
    event.stopPropagation(); // Prevents row selection click events

    // OPTION A: If shareToken is already known on the frontend
    if (this.shareToken) {
      const inviteUrl = `${window.location.origin}/memory/join/${this.shareToken}`;
      await this.copyAndNotify(inviteUrl);
      return;
    }

    // OPTION B: If you need to generate/fetch the link on demand from backend
    this.memoryService.generateShareLink(this.memoryId).subscribe({
      next: async (res) => {
        await this.copyAndNotify(res.directLink);
      },
      error: (err) => {
        console.error('Failed to generate invite link:', err);
        this.snackBar.open('Failed to generate invite link', 'Close', { duration: 3000 });
      }
    });
  }

  private async copyAndNotify(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      this.snackBar.open('Invite link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      this.snackBar.open('Could not copy link automatically', 'Close', { duration: 3000 });
    }
  }

  openDateFinder(): void {
    const plan = this.plannedMemory();
    if (!plan) return;

    this.dialog
      .open<DateFinderDialogComponent, DateFinderDialogData, DateFinderDialogResult>(DateFinderDialogComponent, {
        width: '1100px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        autoFocus: false,
        injector: this.injector,
        data: {
          memoryId: this.memoryId,
          myId: this.loggedInUserId,
          isOwner: this.board.viewer()?.isOwner ?? false,
          crew: this.crew(),
          lockedStart: plan.memory_date ?? null,
          lockedEnd: plan.memory_end_date ?? null,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.plannedMemory.update(p =>
          p ? { ...p, memory_date: result.startDate, memory_end_date: result.endDate } : p);
      });
  }

  /** Silent reload (no spinner) after remote changes. */
  private async refreshPlan(): Promise<void> {
    try {
      const result = await firstValueFrom(this.memoryService.getMemoryToPlan(this.memoryId));
      this.plannedMemory.set(result);
      this.crew.set(result.crew_members || []);
    } catch (err) {
      console.warn('Plan refresh failed:', err);
    }
  }

  promoteIdea(idea: PlanItem): void {
    const category: PollCategory = idea.category === 'dates' ? 'other' : idea.category;
    this.openPollDialog({
      mode: 'create',
      draft: {
        title: POLL_QUESTIONS[category],
        description: idea.description,
        category,
        options: [idea.title],
        sourceItemId: idea.item_id,
      },
    });
  }

  startPollFor(category: ManualMilestoneKey): void {
    this.openPollDialog({ mode: 'create', draft: { category, title: POLL_QUESTIONS[category] } });
  }
}