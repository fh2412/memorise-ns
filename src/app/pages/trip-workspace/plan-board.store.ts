import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlanItemService } from '@services/plan-item.service';
import {
  NewPlanItem, PLAN_CATEGORIES, PLAN_ITEM_TYPES, PlanCategory, PlanEvent, PlanItem, PlanItemPatch, PlanViewer,
} from '@models/planItem.model';

export type PlanColumn = (typeof PLAN_CATEGORIES)[number] & { items: PlanItem[] };

const POLL_MS = 20_000;
const EVENTS_PAGE = 30;
const CATCH_UP_LIMIT = 100; // = backend max
const LAYOUT_KEYS = new Set<string>(['board_x', 'board_y', 'color']); // backend writes no event for these

const seenKey = (memoryId: string) => `memorise.plan.${memoryId}.lastSeenEvent`;
const readSeen = (memoryId: string): number => {
  try { return Number(localStorage.getItem(seenKey(memoryId))) || 0; } catch { return 0; }
};
const writeSeen = (memoryId: string, id: number): void => {
  try { localStorage.setItem(seenKey(memoryId), String(id)); } catch { /* storage unavailable */ }
};

@Injectable()
export class PlanBoardStore {
  private api = inject(PlanItemService);
  private memoryId = '';

  // ---------- items ----------
  private readonly _items = signal<PlanItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly viewer = signal<PlanViewer | null>(null);
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

  /** Mirrors the backend rule: item creator or plan owner. */
  readonly canDelete = computed(() => {
    const v = this.viewer();
    return (item: PlanItem) => !!v && (v.isOwner || item.created_by === v.userId);
  });

  // ---------- activity feed ----------
  private readonly _events = signal<PlanEvent[]>([]); // newest first
  readonly events = this._events.asReadonly();
  readonly hasMoreEvents = signal(false);
  readonly isLoadingOlder = signal(false);
  private readonly lastSeenEventId = signal(0);

  readonly unseenCount = computed(() => {
    const me = this.viewer()?.userId;
    const seen = this.lastSeenEventId();
    return this._events().filter(e => e.event_id > seen && e.user_id !== me).length;
  });

  // ---------- sync bookkeeping ----------
  private pendingWrites = 0;
  private itemsStale = false;
  private polling = false;
  private pollQueued = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const onVisibility = () => { if (!document.hidden) void this.poll(); };
    document.addEventListener('visibilitychange', onVisibility);
    inject(DestroyRef).onDestroy(() => {
      this.stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    });
  }

  async load(memoryId: string): Promise<void> {
    this.memoryId = memoryId;
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const [board, events] = await Promise.all([
        firstValueFrom(this.api.getBoard(memoryId)),
        firstValueFrom(this.api.getEvents(memoryId, { limit: EVENTS_PAGE })),
      ]);
      this._items.set(board.items);
      this.viewer.set(board.viewer);
      this._events.set(events);
      this.hasMoreEvents.set(events.length === EVENTS_PAGE);
      this.lastSeenEventId.set(readSeen(memoryId));
      this.startPolling();
    } catch (err) {
      console.error('Failed to load plan board:', err);
      this.error.set('Could not load plan items');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ---------- writes ----------

  create(draft: NewPlanItem): Promise<PlanItem | null> {
    const offset = (this._items().length % 8) * 32;
    const body: NewPlanItem = {
      category: 'other',
      board_x: 40 + offset,
      board_y: 40 + offset,
      color: PLAN_ITEM_TYPES[draft.type].color,
      ...draft,
    };
    return this.tracked(true, async () => {
      try {
        const created = await firstValueFrom(this.api.createItem(this.memoryId, body));
        this._items.update(list => [...list, created]);
        return created;
      } catch (err) {
        console.error('Failed to create plan item:', err);
        this.error.set('Could not create item');
        return null;
      }
    });
  }

  update(itemId: number, patch: PlanItemPatch): Promise<void> {
    const affectsFeed = Object.keys(patch).some(k => !LAYOUT_KEYS.has(k));
    return this.tracked(affectsFeed, async () => {
      const previous = this._items().find(i => i.item_id === itemId);
      if (!previous) return;

      this.replace({ ...previous, ...patch }); // optimistic
      try {
        const saved = await firstValueFrom(this.api.updateItem(this.memoryId, itemId, patch));
        this.replace(saved);
      } catch (err) {
        console.error('Failed to update plan item:', err);
        this.replace(previous);
        this.error.set('Could not save change');
      }
    });
  }

  moveOnBoard(itemId: number, x: number, y: number): Promise<void> {
    return this.update(itemId, { board_x: Math.max(0, Math.round(x)), board_y: Math.max(0, Math.round(y)) });
  }

  changeCategory(itemId: number, category: PlanCategory): Promise<void> {
    const item = this._items().find(i => i.item_id === itemId);
    if (!item || item.category === category) return Promise.resolve();
    return this.update(itemId, { category });
  }

  toggleDone(item: PlanItem): Promise<void> {
    return this.update(item.item_id, { status: item.status === 'done' ? 'open' : 'done' });
  }

  remove(itemId: number): Promise<void> {
    return this.tracked(true, async () => {
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
    });
  }

  // ---------- feed ----------

  async loadOlderEvents(): Promise<void> {
    const oldest = this._events().at(-1)?.event_id;
    if (!oldest || this.isLoadingOlder()) return;
    this.isLoadingOlder.set(true);
    try {
      const page = await firstValueFrom(
        this.api.getEvents(this.memoryId, { before: oldest, limit: EVENTS_PAGE }),
      );
      this._events.update(list => [...list, ...page]);
      this.hasMoreEvents.set(page.length === EVENTS_PAGE);
    } catch (err) {
      console.error('Failed to load older activity:', err);
      this.error.set('Could not load older activity');
    } finally {
      this.isLoadingOlder.set(false);
    }
  }

  markEventsSeen(): void {
    const newest = this._events()[0]?.event_id ?? 0;
    if (newest <= this.lastSeenEventId()) return;
    this.lastSeenEventId.set(newest);
    writeSeen(this.memoryId, newest);
  }

  // ---------- sync ----------

  /** Counts in-flight writes so a background refresh never overwrites optimistic state. */
  private async tracked<T>(affectsFeed: boolean, op: () => Promise<T>): Promise<T> {
    this.pendingWrites++;
    try {
      return await op();
    } finally {
      this.pendingWrites--;
      if (affectsFeed) void this.poll(); // show own action in the feed immediately
    }
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => void this.poll(), POLL_MS);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll(): Promise<void> {
    if (!this.pollTimer || document.hidden) return;
    if (this.polling) { this.pollQueued = true; return; }
    this.polling = true;

    try {
      const after = this._events()[0]?.event_id ?? 0;
      const fresh = await firstValueFrom(
        this.api.getEvents(this.memoryId, { after, limit: CATCH_UP_LIMIT }),
      );

      if (fresh.length === CATCH_UP_LIMIT) {
        // Too far behind (e.g. laptop slept) → restart the feed from the newest page
        const latest = await firstValueFrom(this.api.getEvents(this.memoryId, { limit: EVENTS_PAGE }));
        this._events.set(latest);
        this.hasMoreEvents.set(true);
      } else if (fresh.length) {
        this._events.update(list => [...fresh, ...list]);
      }

      const me = this.viewer()?.userId;
      if (fresh.some(e => e.user_id !== me)) this.itemsStale = true;
      if (this.itemsStale) await this.refreshItems();
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        this.stopPolling();
        this.error.set('You no longer have access to this plan');
      } else {
        console.warn('Plan sync failed, retrying on next tick:', err);
      }
    } finally {
      this.polling = false;
      if (this.pollQueued) {
        this.pollQueued = false;
        void this.poll();
      }
    }
  }

  private async refreshItems(): Promise<void> {
    if (this.pendingWrites > 0) return; // stays stale → retried next tick
    const board = await firstValueFrom(this.api.getBoard(this.memoryId));
    if (this.pendingWrites > 0) return; // a local write started meanwhile – don't clobber it
    this._items.set(board.items);
    this.viewer.set(board.viewer);
    this.itemsStale = false;
  }

  private replace(item: PlanItem): void {
    this._items.update(list => list.map(i => (i.item_id === item.item_id ? item : i)));
  }
}

function byStatusThenDate(a: PlanItem, b: PlanItem): number {
  const rank = (i: PlanItem) => (i.status === 'done' ? 1 : 0);
  return rank(a) - rank(b) || a.created_at.localeCompare(b.created_at);
}