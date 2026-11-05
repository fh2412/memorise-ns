import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  ManualMilestoneKey, ManualState, MILESTONE_META, MilestoneStatus,
} from '@models/planProgress.model';
import { PlanBoardStore } from '../plan-board.store';
import { BookingKind } from '@models/planBooking.model';

function tooltipFor(m: MilestoneStatus): string {
  if (m.key === 'dates') return m.state === 'done' ? 'Dates are locked' : 'Find dates in the date finder';
  if (m.source === 'auto') return m.key === 'destination' ? 'Destination is set' : 'Decided by a poll';
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
  startPoll = output<ManualMilestoneKey>();
  addBooking = output<BookingKind>();

  readonly isOwner = computed(() => this.store.viewer()?.isOwner ?? false);

  readonly steps = computed(() => this.store.progress().milestones.map(m => ({
    ...m,
    ...MILESTONE_META[m.key],
    tooltip: tooltipFor(m),
    stateIcon: m.state === 'done' ? 'check_circle' : m.state === 'skipped' ? 'do_not_disturb_on' : MILESTONE_META[m.key].icon,
  })));

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