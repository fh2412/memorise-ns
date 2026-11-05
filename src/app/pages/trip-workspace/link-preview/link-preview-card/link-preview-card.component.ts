// trip-workspace/link-preview/link-preview-card/link-preview-card.component.ts
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { LinkPreview } from '@models/planBooking.model';
import { hostOf, isHttpUrl } from '../link-utils';

@Component({
  selector: 'app-link-preview-card',
  templateUrl: './link-preview-card.component.html',
  styleUrl: './link-preview-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compact]': 'compact()' },
})
export class LinkPreviewCardComponent {
  preview = input.required<LinkPreview>();
  /** The URL the user entered (opened on click). */
  url = input.required<string>();
  /** Smaller variant without description (e.g. on booking cards). */
  compact = input(false);

  readonly imgFailed = signal(false);

  readonly href = computed(() => (isHttpUrl(this.url()) ? this.url() : null));
  readonly host = computed(() => hostOf(this.preview().final_url ?? this.url()));
  readonly image = computed(() => {
    const img = this.preview().image_url;
    return isHttpUrl(img) && !this.imgFailed() ? img : null;
  });

  constructor() {
    // New image → try again
    effect(() => {
      this.preview().image_url;
      this.imgFailed.set(false);
    });
  }
}
