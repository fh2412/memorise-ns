// trip-workspace/link-preview/link-preview-field/link-preview-field.component.ts
import {
  ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, output, signal, untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { LinkPreview } from '@models/planBooking.model';
import { LinkPreviewService } from '@services/link-preview.service';
import { apiMessage } from '../../plan-board.store';
import { LinkPreviewCardComponent } from '../link-preview-card/link-preview-card.component';
import { formatPrice, isHttpUrl } from '../link-utils';

const DEBOUNCE_MS = 600;
type State = 'idle' | 'loading' | 'ok' | 'none' | 'error';

/**
 * Shows a live preview for the URL typed into a dialog.
 * Call `settle()` before saving: it fires a pending (debounced) request
 * immediately and waits for it, so the server cache is filled when the item is saved.
 */
@Component({
  selector: 'app-link-preview-field',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, LinkPreviewCardComponent],
  templateUrl: './link-preview-field.component.html',
  styleUrl: './link-preview-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPreviewFieldComponent {
  url = input('');
  memoryId = input.required<string>();
  /** Already known preview (edit mode) – shown without a request if the URL matches. */
  initialPreview = input<LinkPreview | null>(null);

  previewChange = output<LinkPreview | null>();
  usePrice = output<{ priceCents: number; currency: string }>();

  private api = inject(LinkPreviewService);

  readonly state = signal<State>('idle');
  readonly preview = signal<LinkPreview | null>(null);
  readonly message = signal<string | null>(null);

  readonly priceLabel = computed(() => {
    const p = this.preview();
    return p?.price_cents != null && p.price_currency ? formatPrice(p.price_cents, p.price_currency) : null;
  });

  private timer: ReturnType<typeof setTimeout> | null = null;
  private fireNow: (() => void) | null = null;
  private pending: Promise<void> | null = null;
  private token = 0;
  private lastUrl: string | null = null;

  constructor() {
    effect(() => {
      const url = this.url().trim();
      untracked(() => this.schedule(url));
    });
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  /** Fires a pending request now and waits for the current one. Never throws. */
  async settle(): Promise<void> {
    this.fireNow?.();
    await this.pending;
  }

  applyPrice(): void {
    const p = this.preview();
    if (p?.price_cents != null && p.price_currency) {
      this.usePrice.emit({ priceCents: p.price_cents, currency: p.price_currency });
    }
  }

  private schedule(url: string): void {
    if (url === this.lastUrl) return;
    this.clearTimer();
    this.lastUrl = url;
    const token = ++this.token;
    this.fireNow = null;
    this.message.set(null);

    if (!isHttpUrl(url)) {
      this.pending = null;
      this.preview.set(null);
      this.state.set('idle');
      return;
    }

    const known = this.initialPreview();
    if (known && (known.url === url || known.final_url === url)) {
      this.pending = null;
      this.preview.set(known);
      this.state.set('ok');
      return;
    }

    this.preview.set(null);
    this.state.set('loading');
    this.pending = new Promise<void>((resolve) => {
      const fire = () => {
        if (this.fireNow !== fire) return;
        this.fireNow = null;
        this.clearTimer();
        void this.fetch(url, token).finally(resolve);
      };
      this.fireNow = fire;
      this.timer = setTimeout(fire, DEBOUNCE_MS);
    });
  }

  private async fetch(url: string, token: number): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.get(this.memoryId(), url));
      if (token !== this.token) return;
      this.preview.set(res.preview);
      this.state.set(res.preview ? 'ok' : 'none');
      this.previewChange.emit(res.preview);
    } catch (err) {
      if (token !== this.token) return;
      this.preview.set(null);
      this.state.set('error');
      this.message.set(apiMessage(err, 'Could not load a preview'));
      this.previewChange.emit(null);
    }
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
