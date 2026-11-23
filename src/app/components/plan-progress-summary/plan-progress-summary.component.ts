import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlanProgress, summarizeProgress } from '@models/planProgress.model';

@Component({
  selector: 'app-plan-progress-summary',
  imports: [MatProgressBarModule, MatTooltipModule],
  templateUrl: './plan-progress-summary.component.html',
  styleUrl: './plan-progress-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanProgressSummaryComponent {
  progress = input.required<PlanProgress>();

  readonly summary = computed(() => summarizeProgress(this.progress()));
  readonly tooltip = computed(() => {
    const open = this.summary().openLabels;
    return open.length ? `Still open: ${open.join(', ')}` : 'All milestones done';
  });
}