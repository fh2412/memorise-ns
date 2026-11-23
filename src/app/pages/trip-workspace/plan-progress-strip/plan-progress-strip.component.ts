// trip-workspace/plan-progress-strip/plan-progress-strip.component.ts  (full replacement)
import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlanDestination } from '@models/memoryInterface.model';
import { BookingKind } from '@models/planBooking.model';
import {
  ManualMilestoneKey, ManualState, MILESTONE_META, MilestoneStatus,
} from '@models/planProgress.model';
import { PlanBoardStore } from '../plan-board.store';

function tooltipFor(m: MilestoneStatus, dest: PlanDestination | null): string {
  if (m.key === 'dates') return m.state === 'done' ? 'Dates are locked' : 'Find dates in the date finder';
  if (m.key === 'destination') {
    if (m.state === 'skipped') return 'Not needed for this trip';
    if (!dest) return 'No destination yet';
    return dest.has_coordinates ? `Destination: ${dest.label}` : `Destination: ${dest.label} (no map pin yet)`;
  }
  if (m.source === 'auto') return 'Decided by a poll or booking';
  if (m.state === 'done') return 'Marked as done';
  if (m.state === 'skipped') return 'Not needed for this trip';
  return 'Still open';
}

@Component({
  selector: 'app-plan-progress-strip',
  imports: [MatIconModule, MatMenuModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './plan-progress-strip.component.html',
  styleUrl: './plan-progress-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanProgressStripComponent {
  readonly store = inject(PlanBoardStore);

  datesClicked = output<void>();
  destinationClicked = output<void>();
  pinRequested = output<void>();
  startPoll = output<ManualMilestoneKey>();
  addBooking = output<BookingKind>();

  readonly isOwner = computed(() => this.store.viewer()?.isOwner ?? false);
  readonly needsPin = computed(() => {
    const d = this.store.destinationInfo();
    return !!d && !d.has_coordinates;
  });

  readonly steps = computed(() => {
    const dest = this.store.destinationInfo();
    return this.store.progress().milestones.map(m => ({
      ...m,
      ...MILESTONE_META[m.key],
      tooltip: tooltipFor(m, dest),
      stateIcon: m.state === 'done' ? 'check_circle' : m.state === 'skipped' ? 'do_not_disturb_on' : MILESTONE_META[m.key].icon,
    }));
  });

  readonly todos = computed(() => {
    const { done, total } = this.store.progress().todos;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  });

  set(key: ManualMilestoneKey, state: ManualState | null): void {
    void this.store.setMilestone(key, state);
  }

  toggleMine(): void {
    this.store.onlyMine.update(v => !v);
  }
}
