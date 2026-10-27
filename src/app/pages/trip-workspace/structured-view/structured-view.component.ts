import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { PlanCategory, PlanItem } from '@models/planItem.model';
import { PlanColumn } from '../plan-board.store';
import { PlanItemCardComponent } from '../plan-item-card/plan-item-card.component';

@Component({
  selector: 'app-structured-view',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, MatIconModule, PlanItemCardComponent],
  templateUrl: './structured-view.component.html',
  styleUrl: './structured-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructuredViewComponent {
  columns = input.required<PlanColumn[]>();
  categoryChanged = output<{ itemId: number; category: PlanCategory }>();
  toggleDone = output<PlanItem>();
  edit = output<PlanItem>();
  remove = output<PlanItem>();

  onDrop(event: CdkDragDrop<PlanCategory, PlanCategory, PlanItem>): void {
    if (event.previousContainer === event.container) return;
    this.categoryChanged.emit({ itemId: event.item.data.item_id, category: event.container.data });
  }
}