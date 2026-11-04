import {
    afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef,
    inject, Injector, input, output, signal, untracked, viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { PlanComment } from '@models/planItem.model';
import { PlanCommentService } from '@services/plan-comment.service';
import { apiMessage, PlanBoardStore } from '../plan-board.store';
import { timeAgo } from '../time-ago';

const MAX_LENGTH = 2000;

@Component({
    selector: 'app-plan-comments-panel',
    imports: [DatePipe, MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './plan-comments-panel.component.html',
    styleUrl: './plan-comments-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCommentsPanelComponent {
    itemId = input.required<number>();
    closed = output<void>();

    private store = inject(PlanBoardStore);
    private api = inject(PlanCommentService);
    private injector = inject(Injector);
    private threadEl = viewChild<ElementRef<HTMLElement>>('thread');

    readonly maxLength = MAX_LENGTH;
    readonly item = computed(() => this.store.items().find(i => i.item_id === this.itemId()) ?? null);

    /** Newest first, like the API. */
    private readonly comments = signal<PlanComment[]>([]);
    readonly hasMore = signal(false);
    readonly isLoading = signal(true);
    readonly isLoadingOlder = signal(false);
    readonly sending = signal(false);
    readonly draft = signal('');
    readonly editingId = signal<number | null>(null);
    readonly editDraft = signal('');
    readonly confirmDeleteId = signal<number | null>(null);
    private readonly now = signal(Date.now());
    private loadToken = 0;

    /** Oldest first for display (newest at the bottom). */
    readonly rows = computed(() => {
        const now = this.now();
        const me = this.store.viewer()?.userId;
        const isOwner = this.store.viewer()?.isOwner ?? false;
        const byId = new Map(this.store.crew().map(m => [m.user_id, m]));

        return [...this.comments()].reverse().map(c => {
            const member = byId.get(c.user_id);
            const name = member?.name ?? 'Former member';
            const isMine = c.user_id === me;
            return {
                ...c,
                name: isMine ? 'You' : name,
                initial: name.charAt(0).toUpperCase(),
                avatar: member?.profilepic_thumb || null,
                isMine,
                canDelete: isMine || isOwner,
                ago: timeAgo(c.created_at, now),
            };
        });
    });

    constructor() {
        // (Re)load whenever another item's thread is opened
        effect(() => {
            const id = this.itemId();
            untracked(() => void this.load(id));
        });

        // Someone else commented / edited / deleted on this item -> refresh the newest page
        effect(() => {
            const events = this.store.remoteEvents();
            const id = untracked(this.itemId);
            if (events.some(e => e.item_id === id && e.action.startsWith('comment_'))) {
                untracked(() => void this.refreshLatest());
            }
        });

        // The item was deleted by someone -> close the thread
        effect(() => {
            if (!this.store.isLoading() && this.item() === null) {
                untracked(() => this.closed.emit());
            }
        });

        const timer = setInterval(() => this.now.set(Date.now()), 60_000);
        inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }

    // ---------- loading ----------

    private async load(itemId: number): Promise<void> {
        const token = ++this.loadToken;
        this.isLoading.set(true);
        this.comments.set([]);
        this.editingId.set(null);
        this.confirmDeleteId.set(null);
        this.draft.set('');
        try {
            const page = await firstValueFrom(this.api.list(this.store.currentMemoryId, itemId));
            if (token !== this.loadToken) return;
            this.comments.set(page.comments);
            this.hasMore.set(page.hasMore);
            this.scrollToBottom();
        } catch (err) {
            if (token === this.loadToken) this.handleError(err, 'Could not load comments');
        } finally {
            if (token === this.loadToken) this.isLoading.set(false);
        }
    }

    /** Replaces the newest page; older pages that were already loaded stay. */
    private async refreshLatest(): Promise<void> {
        const token = this.loadToken;
        try {
            const page = await firstValueFrom(this.api.list(this.store.currentMemoryId, this.itemId()));
            if (token !== this.loadToken) return;

            const latest = page.comments;
            if (!page.hasMore || latest.length === 0) {
                this.comments.set(latest);
                this.hasMore.set(page.hasMore);
            } else {
                const oldestId = latest[latest.length - 1].comment_id;
                const older = this.comments().filter(c => c.comment_id < oldestId);
                this.comments.set([...latest, ...older]);
                if (older.length === 0) this.hasMore.set(true);
            }

            // Editing a comment that was just deleted remotely -> leave edit mode
            const editing = this.editingId();
            if (editing && !this.comments().some(c => c.comment_id === editing)) {
                this.editingId.set(null);
            }
        } catch (err) {
            console.warn('Comment refresh failed:', err);
        }
    }

    async loadOlder(): Promise<void> {
        const oldest = this.comments().at(-1)?.comment_id;
        if (!oldest || this.isLoadingOlder()) return;
        const token = this.loadToken;
        this.isLoadingOlder.set(true);
        try {
            const page = await firstValueFrom(
                this.api.list(this.store.currentMemoryId, this.itemId(), oldest),
            );
            if (token !== this.loadToken) return;
            this.comments.update(list => [...list, ...page.comments]);
            this.hasMore.set(page.hasMore);
        } catch (err) {
            this.handleError(err, 'Could not load older comments');
        } finally {
            this.isLoadingOlder.set(false);
        }
    }

    // ---------- writing ----------

    /** Enter sends, Shift+Enter adds a new line. */
    onComposerEnter(e: Event): void {
        const k = e as KeyboardEvent;
        if (k.shiftKey || k.isComposing) return;
        k.preventDefault();
        void this.send();
    }

    async send(): Promise<void> {
        const body = this.draft().trim();
        if (!body || body.length > MAX_LENGTH || this.sending()) return;
        const itemId = this.itemId();
        this.sending.set(true);
        try {
            const comment = await firstValueFrom(this.api.add(this.store.currentMemoryId, itemId, body));
            if (itemId !== this.itemId()) return;
            this.comments.update(list => [comment, ...list.filter(c => c.comment_id !== comment.comment_id)]);
            this.draft.set('');
            this.store.adjustCommentCount(itemId, +1);
            this.store.syncNow();
            this.scrollToBottom();
        } catch (err) {
            this.handleError(err, 'Could not send your comment');
        } finally {
            this.sending.set(false);
        }
    }

    startEdit(c: PlanComment): void {
        this.confirmDeleteId.set(null);
        this.editingId.set(c.comment_id);
        this.editDraft.set(c.body);
    }

    cancelEdit(): void {
        this.editingId.set(null);
    }

    onEditKeydown(e: KeyboardEvent, c: PlanComment): void {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelEdit();
        } else if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            void this.saveEdit(c);
        }
    }

    async saveEdit(c: PlanComment): Promise<void> {
        const body = this.editDraft().trim();
        if (!body || body.length > MAX_LENGTH) return;
        if (body === c.body) {
            this.cancelEdit();
            return;
        }
        try {
            const saved = await firstValueFrom(
                this.api.edit(this.store.currentMemoryId, this.itemId(), c.comment_id, body),
            );
            this.comments.update(list => list.map(x => (x.comment_id === saved.comment_id ? saved : x)));
            this.editingId.set(null);
            this.store.syncNow();
        } catch (err) {
            this.handleError(err, 'Could not save your edit');
        }
    }

    /** First click arms, second click deletes. */
    async remove(c: PlanComment): Promise<void> {
        if (this.confirmDeleteId() !== c.comment_id) {
            this.confirmDeleteId.set(c.comment_id);
            return;
        }
        this.confirmDeleteId.set(null);
        const itemId = this.itemId();
        try {
            await firstValueFrom(this.api.remove(this.store.currentMemoryId, itemId, c.comment_id));
            this.comments.update(list => list.filter(x => x.comment_id !== c.comment_id));
            this.store.adjustCommentCount(itemId, -1);
            this.store.syncNow();
        } catch (err) {
            this.handleError(err, 'Could not delete the comment');
        }
    }

    // ---------- helpers ----------

    private handleError(err: unknown, fallback: string): void {
        console.error(fallback, err);
        if (err instanceof HttpErrorResponse && err.status === 404 && err.error?.code === 'ITEM_NOT_FOUND') {
            this.store.error.set('This item was deleted');
            this.closed.emit();
            return;
        }
        this.store.error.set(apiMessage(err, fallback));
    }

    private scrollToBottom(): void {
        afterNextRender(() => {
            const el = this.threadEl()?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight;
        }, { injector: this.injector });
    }
}
