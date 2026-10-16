import { Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-avatar',
  imports: [MatIconModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss',
  host: {
    '[style.--avatar-size.px]': 'size()',
    '[class.elevated]': 'elevated()',
    '[class.interactive]': 'interactive()',
  },
})
export class ProfileAvatarComponent {
  /** URL of the profile picture. Falls back to initials if empty or broken. */
  readonly src = input<string | null | undefined>(null);
  /** Used for initials and the alt text */
  readonly name = input<string>('');
  /** Diameter in px */
  readonly size = input<number>(48);
  /** Shadow under the circle */
  readonly elevated = input<boolean>(true);
  /** Hover lift effect + pointer cursor */
  readonly interactive = input<boolean>(true);

  private readonly imageFailed = signal(false);

  readonly showImage = computed(() => !!this.src() && !this.imageFailed());

  readonly initials = computed(() => {
    const name = this.name()?.trim();
    if (!name) return '?';

    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  onImageError(): void {
    this.imageFailed.set(true);
  }
}