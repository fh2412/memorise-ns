import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlanItemService } from '@services/plan-item.service';
import {
  NewPlanItem, PLAN_CATEGORIES, PLAN_ITEM_TYPES, PlanCategory, PlanItem, PlanItemPatch,
} from '@models/planItem.model';

export type PlanColumn = (typeof PLAN_CATEGORIES)[number] & { items: PlanItem[] };

@Injectable()
export class PlanBoardStore {
  private api = inject(PlanItemService);
  private memoryId = '';

  private readonly _items = signal<PlanItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeItems = computed(() => this._items().filter(i => i.status !== 'dismissed'));

  readonly columns = computed<PlanColumn[]>(() => {
    const items = this.activeItems();
    return PLAN_CATEGORIES.map(cat => ({
      ...cat,
      items: items.filter(i => i.category === cat.key).sort(byStatusThenDate),
    }));
  });

  readonly todoProgress = computed(() => {
    const todos = this.activeItems().filter(i => i.type === 'todo');
    const done = todos.filter(t => t.status === 'done').length;
    return { done, total: todos.length, percent: todos.length ? Math.round((done / todos.length) * 100) : 0 };
  });

  async load(memoryId: string): Promise<void> {
    this.memoryId = memoryId;
    this.isLoading.set(true);
    this.error.set(null);
    try {
      this._items.set(await firstValueFrom(this.api.getItems(memoryId)));
    } catch (err) {
      console.error('Failed to load plan items:', err);
      this.error.set('Could not load plan items');
    } finally {
      this.isLoading.set(false);
    }
  }

  async create(draft: NewPlanItem): Promise<PlanItem | null> {
    const offset = (this._items().length % 8) * 32; // cascade new cards so they don't stack
    const body: NewPlanItem = {
      category: 'other',
      board_x: 40 + offset,
      board_y: 40 + offset,
      color: PLAN_ITEM_TYPES[draft.type].color,
      ...draft,
    };
    try {
      const created = await firstValueFrom(this.api.createItem(this.memoryId, body));
      this._items.update(list => [...list, created]);
      return created;
    } catch (err) {
      console.error('Failed to create plan item:', err);
      this.error.set('Could not create item');
      return null;
    }
  }

  async update(itemId: number, patch: PlanItemPatch): Promise<void> {
    const previous = this._items().find(i => i.item_id === itemId);
    if (!previous) return;

    this.replace({ ...previous, ...patch }); // optimistic
    try {
      const saved = await firstValueFrom(this.api.updateItem(this.memoryId, itemId, patch));
      this.replace(saved);
    } catch (err) {
      console.error('Failed to update plan item:', err);
      this.replace(previous); // rollback only this item
      this.error.set('Could not save change');
    }
  }

  moveOnBoard(itemId: number, x: number, y: number): Promise<void> {
    return this.update(itemId, {
      board_x: Math.max(0, Math.round(x)),
      board_y: Math.max(0, Math.round(y)),
    });
  }

  changeCategory(itemId: number, category: PlanCategory): Promise<void> {
    const item = this._items().find(i => i.item_id === itemId);
    if (!item || item.category === category) return Promise.resolve();
    return this.update(itemId, { category });
  }

  toggleDone(item: PlanItem): Promise<void> {
    return this.update(item.item_id, { status: item.status === 'done' ? 'open' : 'done' });
  }

  async remove(itemId: number): Promise<void> {
    const removed = this._items().find(i => i.item_id === itemId);
    if (!removed) return;

    this._items.update(list => list.filter(i => i.item_id !== itemId));
    try {
      await firstValueFrom(this.api.deleteItem(this.memoryId, itemId));
    } catch (err) {
      console.error('Failed to delete plan item:', err);
      this._items.update(list => [...list, removed]);
      this.error.set('Could not delete item');
    }
  }

  private replace(item: PlanItem): void {
    this._items.update(list => list.map(i => (i.item_id === item.item_id ? item : i)));
  }
}

function byStatusThenDate(a: PlanItem, b: PlanItem): number {
  const rank = (i: PlanItem) => (i.status === 'done' ? 1 : 0);
  return rank(a) - rank(b) || a.created_at.localeCompare(b.created_at);
}