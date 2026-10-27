import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { PlanItem } from '@models/planItem.model';
import { PlanItemCardComponent } from '../plan-item-card/plan-item-card.component';

@Component({
  selector: 'app-corkboard-view',
  imports: [CdkDrag, MatIconModule, PlanItemCardComponent],
  templateUrl: './corkboard-view.component.html',
  styleUrl: './corkboard-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorkboardViewComponent {
  items = input.required<PlanItem[]>();
  moved = output<{ itemId: number; x: number; y: number }>();
  toggleDone = output<PlanItem>();
  edit = output<PlanItem>();
  remove = output<PlanItem>();

  topItemId = signal<number | null>(null);

  onDragEnded(item: PlanItem, event: CdkDragEnd): void {
    const { x, y } = event.source.getFreeDragPosition();
    if (x !== item.board_x || y !== item.board_y) {
      this.moved.emit({ itemId: item.item_id, x, y });
    }
  }
}