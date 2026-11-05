import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PlanItem } from '@models/planItem.model';
import { PlanBoardStore } from '../../plan-board.store';
import { DecidePollData, DecidePollDialogComponent, DecidePollResult } from '../decide-poll-dialog/decide-poll-dialog.component';
import { formatLocation, pickLocation } from '../location-utils';
import { Injector } from '@angular/core';
import { BookingKind } from '@models/planBooking.model';
import { BookingDialogComponent, BookingDialogData } from '../../bookings/booking-dialog/booking-dialog.component';

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const MAX_AVATARS = 5;
const MAX_OPTIONS = 20;

function closesIn(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 60) return rtf.format(Math.max(1, min), 'minute');
  const h = Math.round(min / 60);
  return h < 48 ? rtf.format(h, 'hour') : rtf.format(Math.round(h / 24), 'day');
}

@Component({
  selector: 'app-poll-body',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './poll-body.component.html',
  styleUrl: './poll-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Clicking options must not start a corkboard drag
    '(mousedown)': '$event.stopPropagation()',
    '(touchstart)': '$event.stopPropagation()',
  },
})
export class PollBodyComponent {
  item = input.required<PlanItem>();

  private store = inject(PlanBoardStore);
  private dialog = inject(MatDialog);
  private injector = inject(Injector);

  private readonly now = signal(Date.now());
  readonly busy = signal(false);
  readonly newOption = signal('');

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  readonly poll = computed(() => this.item().poll!);
  readonly canManage = computed(() => this.store.canManagePoll()(this.item()));
  readonly decided = computed(() => this.poll().decided_option_id != null);
  readonly closed = computed(() => {
    const p = this.poll();
    return p.is_closed || (!!p.closes_at && Date.parse(p.closes_at) <= this.now());
  });
  readonly votingOpen = computed(() => !this.decided() && !this.closed());
  readonly atLimit = computed(() => {
    const p = this.poll();
    return p.multiple && !!p.max_choices && p.my_votes.length >= p.max_choices;
  });
  readonly canAddOption = computed(() =>
    this.votingOpen()
    && (this.poll().allow_member_options || this.canManage())
    && this.poll().options.length < MAX_OPTIONS);

  readonly choiceLabel = computed(() => {
    const p = this.poll();
    if (!p.multiple) return 'Pick one';
    return p.max_choices ? `Pick up to ${p.max_choices}` : 'Pick any';
  });

  readonly deadlineLabel = computed(() => {
    if (this.decided()) return null;
    if (this.closed()) return 'Voting closed – waiting for decision';
    const c = this.poll().closes_at;
    return c ? `Closes ${closesIn(Date.parse(c) - this.now())}` : null;
  });

  private readonly crewById = computed(() => new Map(this.store.crew().map(m => [m.user_id, m])));
  readonly eligibleVoters = computed(() => this.store.crew().filter(m => !m.isPlaceholder).length);

  readonly rows = computed(() => {
    const p = this.poll();
    const crew = this.crewById();
    const mine = new Set(p.my_votes);
    const top = Math.max(0, ...p.options.map(o => o.votes ?? 0));

    return p.options.map(o => {
      const voters = (o.voters ?? []).map(id => {
        const m = crew.get(id);
        const name = m?.name ?? 'Former member';
        return { id, name, initial: name.charAt(0).toUpperCase(), avatar: m?.profilepic_thumb || null };
      });
      const votes = o.votes ?? 0;
      return {
        option_id: o.option_id,
        label: o.label,
        votes,
        percent: p.total_voters ? Math.round((votes / p.total_voters) * 100) : 0,
        mine: mine.has(o.option_id),
        winner: p.decided_option_id === o.option_id,
        leading: !this.decided() && top > 0 && votes === top,
        hasLocation: !!o.location,
        locationLabel: formatLocation(o.location),
        shownVoters: voters.slice(0, MAX_AVATARS),
        moreVoters: Math.max(0, voters.length - MAX_AVATARS),
        voterNames: voters.map(v => v.name).join(', '),
      };
    });
  });

  readonly needsDestination = computed(() => {
    const p = this.poll();
    if (!this.decided() || this.item().category !== 'destination') return false;
    return !p.options.find(o => o.option_id === p.decided_option_id)?.location;
  });

  readonly canCreateBooking = computed(() => {
    const category = this.item().category;
    if (!this.decided() || !['stay', 'transport', 'activity'].includes(category)) return false;
    const id = this.item().item_id;
    return !this.store.items().some(i => i.type === 'booking' && i.booking?.source_poll_id === id);
  });

  vote(optionId: number): void {
    if (!this.votingOpen()) return;
    const p = this.poll();
    const mine = p.my_votes;
    let next: number[];
    if (!p.multiple) next = mine.includes(optionId) ? [] : [optionId];
    else if (mine.includes(optionId)) next = mine.filter(id => id !== optionId);
    else if (this.atLimit()) return;
    else next = [...mine, optionId];
    void this.store.vote(this.item().item_id, next);
  }

  async addOption(): Promise<void> {
    const label = this.newOption().trim();
    if (!label || this.busy()) return;
    this.busy.set(true);
    const saved = await this.store.addPollOption(this.item().item_id, { label });
    if (saved) this.newOption.set('');
    this.busy.set(false);
  }

  async decide(): Promise<void> {
    const ref = this.dialog.open<DecidePollDialogComponent, DecidePollData, DecidePollResult>(
      DecidePollDialogComponent,
      {
        width: '520px',
        maxWidth: '95vw',
        autoFocus: false,
        data: { item: this.item(), currentDestination: this.store.destination() },
      },
    );
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    this.busy.set(true);
    await this.store.decidePoll(this.item().item_id, result);
    this.busy.set(false);
  }

  async setLocation(): Promise<void> {
    const loc = await pickLocation(this.dialog, this.store.destination());
    if (!loc) return;
    this.busy.set(true);
    await this.store.setPollDestination(this.item().item_id, loc);
    this.busy.set(false);
  }

  async reopen(): Promise<void> {
    this.busy.set(true);
    await this.store.reopenPoll(this.item().item_id);
    this.busy.set(false);
  }

  createBooking(): void {
    const p = this.poll();
    const winner = p.options.find(o => o.option_id === p.decided_option_id);
    this.dialog.open<BookingDialogComponent, BookingDialogData, boolean>(BookingDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      autoFocus: false,
      injector: this.injector, // dialog needs PlanBoardStore
      data: {
        mode: 'create',
        draft: {
          kind: this.item().category as BookingKind,
          title: winner?.label ?? '',
          location: winner?.location ?? null,
          sourcePollId: this.item().item_id,
        },
      },
    });
  }
}