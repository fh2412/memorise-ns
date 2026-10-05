import { Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MemoryDetailFriend } from '@models/userInterface.model';

@Component({
  selector: 'app-friends-profile-pics',
  imports: [MatTooltipModule, MatBadgeModule, MatIconModule],
  templateUrl: './friends-profile-pics.component.html',
  styleUrl: './friends-profile-pics.component.scss'
})
export class FriendsProfilePicsComponent {
  readonly friends = input<MemoryDetailFriend[]>([]);
  /** How many avatars are shown before the "+N" circle */
  readonly maxVisible = input<number>(3);

  /** Horizontal offset between two avatars in px */
  readonly overlap = 20;
  private readonly avatarSize = 48;

  get displayedFriends(): MemoryDetailFriend[] {
    return this.friends().slice(0, this.maxVisible());
  }

  get remainingCount(): number {
    return Math.max(0, this.friends().length - this.maxVisible());
  }

  get remainingLabel(): string {
    return this.remainingCount > 99 ? '99+' : `+${this.remainingCount}`;
  }

  /** The wrapper's children are absolutely positioned, so its width has to be set explicitly */
  get wrapperWidth(): number {
    const circles = this.displayedFriends.length + (this.remainingCount > 0 ? 1 : 0);
    return circles === 0 ? 0 : (circles - 1) * this.overlap + this.avatarSize;
  }

  getInitials(name: string): string {
    if (!name) return '?';

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getTooltipText(friend: MemoryDetailFriend): string {
    const parts = [friend.name];

    if (friend.country) {
      parts.push(`from ${friend.country}`);
    }

    if (friend.sharedMemoriesCount > 0) {
      parts.push(`${friend.sharedMemoriesCount} shared memories`);
    }

    return parts.join(' • ');
  }

  getRemainingTooltip(): string {
    const remainingFriends = this.friends().slice(this.maxVisible());
    const names = remainingFriends.slice(0, 5).map(f => f.name);

    if (remainingFriends.length > 5) {
      names.push(`and ${remainingFriends.length - 5} others`);
    }

    return names.join(', ');
  }

  onImageError(event: Event): void {
    // Hide broken image and show default avatar
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}