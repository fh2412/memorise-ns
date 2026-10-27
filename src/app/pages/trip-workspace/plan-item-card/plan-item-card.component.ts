import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { PLAN_ITEM_TYPES, PlanItem } from '@models/planItem.model';

@Component({
  selector: 'app-plan-item-card',
  imports: [MatIconModule, MatButtonModule, MatCheckboxModule, MatMenuModule, DatePipe],
  templateUrl: './plan-item-card.component.html',
  styleUrl: './plan-item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-done]': "item().status === 'done'",
    '[style.--card-color]': 'cardColor()',
  },
})
export class PlanItemCardComponent {
  item = input.required<PlanItem>();
  toggleDone = output<void>();
  edit = output<void>();
  remove = output<void>();

  meta = computed(() => PLAN_ITEM_TYPES[this.item().type]);
  cardColor = computed(() => this.item().color ?? this.meta().color);
  linkUrl = computed(() => {
    const url = this.item().payload?.['url'];
    return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : null;
  });
}