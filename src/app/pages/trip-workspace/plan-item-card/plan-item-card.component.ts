import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { PLAN_ITEM_TYPES, PlanItem, REACTIONS, REACTION_EMOJI, ReactionKey } from '@models/planItem.model';
import { PollBodyComponent } from '../polls/poll-body/poll-body.component';
import { PlanBoardStore } from '../plan-board.store';
import { BookingBodyComponent } from '../bookings/booking-body/booking-body.component';
import { LinkPreviewCardComponent } from '../link-preview/link-preview-card/link-preview-card.component';
import { readLinkPayload } from '../link-preview/link-utils';
import { BOOKING_KIND_META } from '@models/planBooking.model';

@Component({
  selector: 'app-plan-item-card',
  imports: [MatIconModule, MatButtonModule, MatCheckboxModule, MatMenuModule, DatePipe, PollBodyComponent, BookingBodyComponent, LinkPreviewCardComponent],
  templateUrl: './plan-item-card.component.html',
  styleUrl: './plan-item-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-done]': "item().status === 'done'",
    '[class.is-poll]': "item().type === 'poll'",
    '[style.--card-color]': 'cardColor()',
    '[class.thread-open]': 'store.openThreadId() === item().item_id',
    '[class.is-booking]': "item().type === 'booking'",
    '[class.is-cancelled]': "item().booking?.status === 'cancelled'",
  },
})
export class PlanItemCardComponent {
  protected store = inject(PlanBoardStore);

  item = input.required<PlanItem>();
  canDelete = input(false);
  toggleDone = output<void>();
  edit = output<void>();
  remove = output<void>();
  promote = output<void>();

  meta = computed(() => PLAN_ITEM_TYPES[this.item().type]);
  cardColor = computed(() => this.item().color ?? this.meta().color);
  canPromote = computed(() => this.item().type === 'idea' && this.item().status === 'open');
  readonly link = computed(() => readLinkPayload(this.item()));

  readonly icon = computed(() => {
    const b = this.item().booking;
    return b ? BOOKING_KIND_META[b.kind].icon : this.meta().icon;
  });

  readonly assigneeChips = computed(() => {
    const byId = new Map(this.store.crew().map(m => [m.user_id, m]));
    const me = this.store.viewer()?.userId;
    return this.item().assignees.map(id => {
      const m = byId.get(id);
      const name = id === me ? 'You' : m?.name ?? 'Former member';
      return { id, name, initial: name.charAt(0).toUpperCase(), avatar: m?.profilepic_thumb || null, isMe: id === me };
    });
  });
  readonly assigneeNames = computed(() => this.assigneeChips().map(a => a.name).join(', '));

  readonly reactionOptions = REACTIONS;

  readonly reactionChips = computed(() => {
    const byId = new Map(this.store.crew().map(m => [m.user_id, m.name]));
    const me = this.store.viewer()?.userId;
    return (this.item().reactions ?? []).map(r => ({
      ...r,
      emoji: REACTION_EMOJI[r.key],
      names: r.users.map(id => (id === me ? 'You' : byId.get(id) ?? 'Former member')).join(', '),
    }));
  });

  react(key: ReactionKey): void {
    void this.store.toggleReaction(this.item().item_id, key);
  }

  openComments(): void {
    this.store.openThreadId.set(this.item().item_id);
  }

  refreshPreview(): void {
    void this.store.refreshPreview(this.item());
  }
}