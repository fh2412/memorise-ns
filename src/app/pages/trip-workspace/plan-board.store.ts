import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlanItemService } from '@services/plan-item.service';
import { Observable } from 'rxjs';
import { CrewMember } from '@models/userInterface.model';
import { PlanLocation } from '@models/memoryInterface.model';
import { PlanPollService } from '@services/plan-poll.service';
import {
  NewPlanItem, PLAN_CATEGORIES, PLAN_ITEM_TYPES, PlanCategory, PlanEvent, PlanItem, PlanItemPatch, PlanViewer, DecidePollBody, NewPoll, NewPollOption, PollOptionPatch, PollSettingsPatch, HIDDEN_EVENT_ACTIONS, REACTIONS, ReactionKey, ReactionSummary
} from '@models/planItem.model';
import { buildProgress, ManualMilestone, ManualMilestoneKey, ManualState } from '@models/planProgress.model';
import { PlanCommentService } from '@services/plan-comment.service';
import { PlanBookingService } from '@services/plan-booking.service';
import { LinkPreviewService } from '@services/link-preview.service';
import { BookingInput, NewBooking } from '@models/planBooking.model';
import { readLinkPayload } from './link-preview/link-utils';

export type PlanColumn = (typeof PLAN_CATEGORIES)[number] & { items: PlanItem[] };

const POLL_MS = 20_000;
const EVENTS_PAGE = 30;
const CATCH_UP_LIMIT = 100; // = backend max
const LAYOUT_KEYS = new Set<string>(['board_x', 'board_y', 'color']); // backend writes no event for these

const COALESCE_GROUP: Record<string, string> = {
  availability_updated: 'availability',
  poll_voted: 'vote',
  poll_unvoted: 'vote',
  item_reacted: 'react',
  item_unreacted: 'react',
};

const COALESCE_WINDOW_MS = 6 * 3_600_000;
const coalesceKey = (e: PlanEvent): string | null => {
  const group = COALESCE_GROUP[e.action];
  return group ? `${e.user_id}|${group}|${e.item_id ?? ''}` : null;
};

const BOARD_ACTION = /^(item_|poll_|comment_|milestone_|destination_set$)/;

const seenKey = (memoryId: string) => `memorise.plan.${memoryId}.lastSeenEvent`;
const readSeen = (memoryId: string): number => {
  try { return Number(localStorage.getItem(seenKey(memoryId))) || 0; } catch { return 0; }
};
const writeSeen = (memoryId: string, id: number): void => {
  try { localStorage.setItem(seenKey(memoryId), String(id)); } catch { /* storage unavailable */ }
};

export function apiMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse && err.status >= 400 && err.status < 500) {
    const msg = err.error?.message;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}

function byStatusThenDate(a: PlanItem, b: PlanItem): number {
  const rank = (i: PlanItem) => (i.status === 'done' ? 1 : 0);
  return rank(a) - rank(b) || a.created_at.localeCompare(b.created_at);
}

/** Local mirror of the backend's summarizeReactions (fixed order, only used keys). */
function applyReaction(list: ReactionSummary[], key: ReactionKey, me: string, on: boolean): ReactionSummary[] {
  const byKey = new Map(list.map(r => [r.key, r]));
  const users = (byKey.get(key)?.users ?? []).filter(u => u !== me);
  if (on) users.push(me);
  if (users.length) byKey.set(key, { key, count: users.length, mine: on, users });
  else byKey.delete(key);
  return REACTIONS.flatMap(r => byKey.get(r.key) ?? []);
}

@Injectable()
export class PlanBoardStore {
  private api = inject(PlanItemService);
  private pollApi = inject(PlanPollService);
  private bookingApi = inject(PlanBookingService);
  private previewApi = inject(LinkPreviewService);
  private commentApi = inject(PlanCommentService);


  private memoryId = '';

  // ---------- items ----------
  private readonly _items = signal<PlanItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly viewer = signal<PlanViewer | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly remoteEvents = signal<PlanEvent[]>([]);
  readonly crew = signal<CrewMember[]>([]);
  readonly destination = signal<PlanLocation | null>(null);
  readonly planVersion = signal(0);

  readonly canManagePoll = computed(() => {
    const v = this.viewer();
    return (item: PlanItem) => !!v && (v.isOwner || item.created_by === v.userId);
  });

  private voteQueue = new Map<number, Promise<PlanItem | null>>();
  private voteSeq = new Map<number, number>();
  readonly activeItems = computed(() => this._items().filter(i => i.status !== 'dismissed'));

  readonly columns = computed<PlanColumn[]>(() => {
    const items = this.visibleItems();
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
    return this._events()
      .filter(e => e.event_id > seen && e.user_id !== me && !HIDDEN_EVENT_ACTIONS.has(e.action)).length;
  });

  readonly hasDates = signal(false);
  readonly milestoneStates = signal<ManualMilestone[]>([]);
  readonly onlyMine = signal(false);

  readonly visibleItems = computed(() => {
    const items = this.activeItems();
    if (!this.onlyMine()) return items;
    const me = this.viewer()?.userId;
    return me ? items.filter(i => i.type === 'todo' && i.assignees.includes(me)) : [];
  });

  readonly myOpenTodos = computed(() => {
    const me = this.viewer()?.userId;
    if (!me) return 0;
    return this.activeItems()
      .filter(i => i.type === 'todo' && i.status === 'open' && i.assignees.includes(me)).length;
  });

  readonly progress = computed(() => {
    const items = this.activeItems();
    const decided = new Set<string>(items
      .filter(i => i.type === 'poll' && i.poll?.decided_option_id != null)
      .map(i => i.category));
    for (const i of items) {
      const b = i.booking;
      if (i.type === 'booking' && b?.status === 'booked' && (b.kind === 'stay' || b.kind === 'transport')) {
        decided.add(b.kind);
      }
    }
    const { done, total } = this.todoProgress();
    return buildProgress({
      hasDates: this.hasDates(),
      hasLocation: !!this.destination(),
      decided,
      manual: this.milestoneStates(),
      todos: { done, total },
    });
  });

  /** Item whose comment thread is open in the sidebar. */
  readonly openThreadId = signal<number | null>(null);

  private reactionQueue = new Map<number, Promise<void>>();
  private reactionSeq = new Map<number, number>();

  get currentMemoryId(): string {
    return this.memoryId;
  }

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
      this.milestoneStates.set(board.milestones ?? []);
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
    if (item.type === 'booking') {
      this.error.set('Bookings stay in their own column');
      return Promise.resolve();
    }
    if (item.type === 'poll' && category === 'dates') {
      this.error.set('Dates are chosen with the date finder');
      return Promise.resolve();
    }
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

      let incoming = fresh;
      if (fresh.length === CATCH_UP_LIMIT) {
        const latest = await firstValueFrom(this.api.getEvents(this.memoryId, { limit: EVENTS_PAGE }));
        this._events.set(latest);
        this.hasMoreEvents.set(true);
        incoming = latest;
        this.itemsStale = true;
      } else if (fresh.length) {
        this.mergeFresh(fresh);
      }

      const me = this.viewer()?.userId;
      const remote = incoming.filter(e => e.user_id !== me);
      if (remote.length) this.remoteEvents.set(remote);
      // Only item events require reloading the board (availability changes don't)
      if (remote.some(e => e.action.startsWith('item_'))) this.itemsStale = true;
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
    this.milestoneStates.set(board.milestones ?? []);
    this.itemsStale = false;
  }

  private replace(item: PlanItem): void {
    this._items.update(list => list.map(i => (i.item_id === item.item_id ? item : i)));
  }

  syncNow(): void {
    void this.poll();
  }

  private mergeFresh(fresh: PlanEvent[]): void {
    const keys = new Set(fresh.map(coalesceKey).filter((k): k is string => k !== null));
    const cutoff = Date.now() - COALESCE_WINDOW_MS;
    this._events.update(list => [
      ...fresh,
      ...list.filter(e => {
        const key = coalesceKey(e);
        return !(key && keys.has(key) && Date.parse(e.created_at) > cutoff);
      }),
    ]);
  }

  // ---------- polls ----------

  createPoll(draft: NewPoll): Promise<PlanItem | null> {
    const offset = (this._items().length % 8) * 32;
    const body: NewPoll = {
      color: PLAN_ITEM_TYPES.poll.color,
      // promoted polls take the idea's spot on the corkboard (set by the backend)
      ...(draft.sourceItemId ? {} : { board_x: 40 + offset, board_y: 40 + offset }),
      ...draft,
    };
    return this.tracked(true, async () => {
      try {
        const created = await firstValueFrom(this.pollApi.create(this.memoryId, body));
        this._items.update(list => [
          ...list.map(i => (i.item_id === draft.sourceItemId ? { ...i, status: 'dismissed' as const } : i)),
          created,
        ]);
        return created;
      } catch (err) {
        console.error('Failed to create poll:', err);
        this.error.set(apiMessage(err, 'Could not create the poll'));
        return null;
      }
    });
  }

  /** Optimistic for my own choice; requests per poll are sent strictly in order. */
  vote(itemId: number, optionIds: number[]): Promise<PlanItem | null> {
    const current = this._items().find(i => i.item_id === itemId);
    if (current?.poll) this.replace({ ...current, poll: { ...current.poll, my_votes: optionIds } });

    const seq = (this.voteSeq.get(itemId) ?? 0) + 1;
    this.voteSeq.set(itemId, seq);
    const previous = this.voteQueue.get(itemId) ?? Promise.resolve(null);
    const next = previous.then(() => this.pollWrite(
      'Could not save your vote',
      () => this.pollApi.vote(this.memoryId, itemId, optionIds),
      () => this.voteSeq.get(itemId) === seq, // a newer click wins → no flicker
    ));
    this.voteQueue.set(itemId, next);
    return next;
  }

  updatePollSettings(itemId: number, patch: PollSettingsPatch): Promise<PlanItem | null> {
    return this.pollWrite('Could not save the poll settings',
      () => this.pollApi.updateSettings(this.memoryId, itemId, patch));
  }

  addPollOption(itemId: number, option: NewPollOption): Promise<PlanItem | null> {
    return this.pollWrite('Could not add the option', () => this.pollApi.addOption(this.memoryId, itemId, option));
  }

  updatePollOption(itemId: number, optionId: number, patch: PollOptionPatch): Promise<PlanItem | null> {
    return this.pollWrite('Could not save the option',
      () => this.pollApi.updateOption(this.memoryId, itemId, optionId, patch));
  }

  deletePollOption(itemId: number, optionId: number): Promise<PlanItem | null> {
    return this.pollWrite('Could not remove the option',
      () => this.pollApi.deleteOption(this.memoryId, itemId, optionId));
  }

  reopenPoll(itemId: number): Promise<PlanItem | null> {
    return this.pollWrite('Could not reopen the poll', () => this.pollApi.reopen(this.memoryId, itemId));
  }

  decidePoll(itemId: number, body: DecidePollBody): Promise<{ needsLocation: boolean } | null> {
    return this.tracked(true, async () => {
      try {
        const res = await firstValueFrom(this.pollApi.decide(this.memoryId, itemId, body));
        this.replace(res.item);
        this.planVersion.update(v => v + 1);
        return { needsLocation: res.needsLocation };
      } catch (err) {
        console.error('Failed to decide poll:', err);
        this.error.set(apiMessage(err, 'Could not decide the poll'));
        this.itemsStale = true;
        return null;
      }
    });
  }

  async setPollDestination(itemId: number, location: PlanLocation): Promise<PlanItem | null> {
    const saved = await this.pollWrite('Could not set the destination',
      () => this.pollApi.setDestination(this.memoryId, itemId, location));
    if (saved) this.planVersion.update(v => v + 1);
    return saved;
  }

  /** On failure: mark stale and re-sync from the server instead of a manual rollback. */
  private pollWrite(
    fallback: string,
    call: () => Observable<PlanItem>,
    shouldApply: () => boolean = () => true,
  ): Promise<PlanItem | null> {
    return this.tracked(true, async () => {
      try {
        const item = await firstValueFrom(call());
        if (shouldApply()) this.replace(item);
        return item;
      } catch (err) {
        console.error(fallback, err);
        this.error.set(apiMessage(err, fallback));
        this.itemsStale = true;
        return null;
      }
    });
  }

  /** Owner only. Optimistic; rolls back on failure. */
  setMilestone(key: ManualMilestoneKey, state: ManualState | null): Promise<void> {
    return this.tracked(true, async () => {
      const previous = this.milestoneStates();
      this.milestoneStates.set([
        ...previous.filter(m => m.milestone !== key),
        ...(state ? [{ milestone: key, state }] : []),
      ]);
      try {
        this.milestoneStates.set(await firstValueFrom(this.api.setMilestone(this.memoryId, key, state)));
      } catch (err) {
        console.error('Failed to update milestone:', err);
        this.milestoneStates.set(previous);
        this.error.set(apiMessage(err, 'Could not update the milestone'));
      }
    });
  }

  /** Optimistic toggle; requests per item are sent strictly in order. */
  toggleReaction(itemId: number, key: ReactionKey): Promise<void> {
    const me = this.viewer()?.userId;
    const item = this._items().find(i => i.item_id === itemId);
    if (!me || !item) return Promise.resolve();

    const on = !item.reactions.some(r => r.key === key && r.mine);
    this.replace({ ...item, reactions: applyReaction(item.reactions, key, me, on) });

    const seq = (this.reactionSeq.get(itemId) ?? 0) + 1;
    this.reactionSeq.set(itemId, seq);

    const send = () => this.tracked(true, async () => {
      try {
        const reactions = await firstValueFrom(this.commentApi.react(this.memoryId, itemId, key, on));
        if (this.reactionSeq.get(itemId) === seq) this.patchItem(itemId, { reactions }); // newest click wins
      } catch (err) {
        console.error('Failed to update reaction:', err);
        this.error.set(apiMessage(err, 'Could not save your reaction'));
        this.itemsStale = true; // next sync restores the server state
      }
    });

    const next = (this.reactionQueue.get(itemId) ?? Promise.resolve()).then(send);
    this.reactionQueue.set(itemId, next);
    return next;
  }

  patchItem(itemId: number, patch: Partial<PlanItem>): void {
    this._items.update(list => list.map(i => (i.item_id === itemId ? { ...i, ...patch } : i)));
  }

  /** Own comment added/deleted → keep the card count right until the next sync. */
  adjustCommentCount(itemId: number, delta: number): void {
    const item = this._items().find(i => i.item_id === itemId);
    if (item) this.patchItem(itemId, { comment_count: Math.max(0, item.comment_count + delta) });
  }

  // ---------- bookings ----------

  /** Throws on failure – the booking dialog shows the message inline. */
  createBooking(draft: NewBooking): Promise<PlanItem> {
    const offset = (this._items().length % 8) * 32;
    const body: NewBooking = {
      color: PLAN_ITEM_TYPES.booking.color,
      board_x: 40 + offset,
      board_y: 40 + offset,
      ...draft,
    };
    return this.tracked(true, async () => {
      const created = await firstValueFrom(this.bookingApi.create(this.memoryId, body));
      this._items.update(list => [...list, created]);
      return created;
    });
  }

  /** Throws on failure – the booking dialog shows the message inline. */
  updateBooking(itemId: number, patch: BookingInput): Promise<PlanItem> {
    return this.tracked(true, async () => {
      const saved = await firstValueFrom(this.bookingApi.update(this.memoryId, itemId, patch));
      this.replace(saved);
      return saved;
    });
  }

  /** Re-fetches the preview (bypassing the cache) and re-saves the link so the item gets it. */
  refreshPreview(item: PlanItem): Promise<void> {
    const link = readLinkPayload(item);
    if (!link) return Promise.resolve();
    return this.tracked(true, async () => {
      try {
        const res = await firstValueFrom(this.previewApi.get(this.memoryId, link.url, true));
        if (!res.preview) this.error.set('No preview available for this link');
        const saved = item.type === 'booking'
          ? await firstValueFrom(this.bookingApi.update(this.memoryId, item.item_id, { url: link.url }))
          : await firstValueFrom(this.api.updateItem(this.memoryId, item.item_id, { payload: { url: link.url } }));
        this.replace(saved);
      } catch (err) {
        console.error('Failed to refresh preview:', err);
        this.error.set(apiMessage(err, 'Could not refresh the preview'));
      }
    });
  }

}