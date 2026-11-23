// trip-workspace/bookings/booking-body/booking-body.component.ts
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlanItem } from '@models/planItem.model';
import { BOOKING_STATUS_META, TRANSPORT_MODE_META } from '@models/planBooking.model';
import { PlanBoardStore } from '../../plan-board.store';
import { formatLocation } from '../../polls/location-utils';
import { formatPrice } from '../../link-preview/link-utils';
import { formatBookingWhen } from '../booking-utils';

/** Compact booking summary inside a plan item card. The link preview is rendered by the card itself. */
@Component({
  selector: 'app-booking-body',
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './booking-body.component.html',
  styleUrl: './booking-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingBodyComponent {
  item = input.required<PlanItem>();

  private store = inject(PlanBoardStore);
  readonly copied = signal(false);
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.copyTimer) clearTimeout(this.copyTimer);
    });
  }

  readonly b = computed(() => this.item().booking!);
  readonly status = computed(() => BOOKING_STATUS_META[this.b().status]);
  readonly modeIcon = computed(() => {
    const mode = this.b().transport_mode;
    return mode ? TRANSPORT_MODE_META[mode].icon : 'commute';
  });

  readonly when = computed(() => formatBookingWhen(this.b()));

  readonly route = computed(() => {
    const b = this.b();
    if (b.kind !== 'transport' || (!b.origin && !b.destination)) return null;
    return `${b.origin || '?'} → ${b.destination || '?'}`;
  });

  readonly service = computed(() => {
    const b = this.b();
    return b.kind === 'transport' ? [b.carrier, b.transport_number].filter(Boolean).join(' ') || null : null;
  });

  readonly place = computed(() => {
    const b = this.b();
    if (b.kind === 'transport') return null;
    return b.address || formatLocation(b.location) || null;
  });

  readonly price = computed(() => {
    const b = this.b();
    return b.price_cents != null ? formatPrice(b.price_cents, b.currency) : null;
  });

  readonly payer = computed(() => {
    const id = this.b().paid_by;
    if (!id) return null;
    if (id === this.store.viewer()?.userId) return 'you';
    return this.store.crew().find(m => m.user_id === id)?.name ?? 'a former member';
  });

  async copyCode(): Promise<void> {
    const code = this.b().confirmation_code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      this.copied.set(true);
      if (this.copyTimer) clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.store.error.set('Could not copy to the clipboard');
    }
  }
}
