import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { PLAN_ITEM_TYPES, PlanItem } from '@models/planItem.model';
import { PollBodyComponent } from '../polls/poll-body/poll-body.component';

@Component({
  selector: 'app-plan-item-card',
  imports: [MatIconModule, MatButtonModule, MatCheckboxModule, MatMenuModule, DatePipe, PollBodyComponent],
  templateUrl: './plan-item-card.component.html',
  styleUrl: './plan-item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-done]': "item().status === 'done'",
    '[class.is-poll]': "item().type === 'poll'",
    '[style.--card-color]': 'cardColor()',
  },
})
export class PlanItemCardComponent {
  item = input.required<PlanItem>();
  canDelete = input(false);
  toggleDone = output<void>();
  edit = output<void>();
  remove = output<void>();
  promote = output<void>();

  meta = computed(() => PLAN_ITEM_TYPES[this.item().type]);
  cardColor = computed(() => this.item().color ?? this.meta().color);
  canPromote = computed(() => this.item().type === 'idea' && this.item().status === 'open');
  linkUrl = computed(() => {
    const url = this.item().payload?.['url'];
    return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : null;
  });
}