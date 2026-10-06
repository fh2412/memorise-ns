import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PlannedMemory } from '@models/memoryInterface.model';
import { crewMemberToFriend } from '@models/userInterface.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemoryService } from '@services/memory.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatCard } from '@angular/material/card';
import { FriendsProfilePicsComponent } from '../friends-profile-pics/friends-profile-pics.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PinnedMemoryService } from '@services/pinnedMemorService';
import { finalize } from 'rxjs';
import { UserService } from '@services/userService';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrl: './memory-card.component.scss',
  imports: [MatCard, FriendsProfilePicsComponent, MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger],
})
export class MemoryCardComponent {
  private router = inject(Router);
  private datePipe = inject(DatePipe);
  private snackBar = inject(MatSnackBar);
  private memoryService = inject(MemoryService);
  private clipboard = inject(Clipboard);
  private pinnedMemoryService = inject(PinnedMemoryService);
  private userService = inject(UserService);

  readonly cardData = input.required<PlannedMemory>();

  readonly crewAsFriends = computed(() =>
    (this.cardData().crew_members ?? []).map(crewMemberToFriend)
  );

  titleUrl: string | undefined;
  readonly isPinning = signal(false);
  private readonly pinOverride = signal<boolean | null>(null);
  readonly isPinned = computed(() => this.pinOverride() ?? this.cardData().isPinned ?? false);

  isGeneratingLink = false;

  addPhotosMemory(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/editmemory', this.cardData().memory_id, 'addphotos']);
  }

  shareMemory(event?: Event) {
    event?.stopPropagation();

    if (this.isGeneratingLink) {
      return;
    }

    this.isGeneratingLink = true;

    this.memoryService.generateShareLink(this.cardData().memory_id).subscribe({
      next: (response) => {
        const success = this.clipboard.copy(response.directLink);

        if (success) {
          this.snackBar.open('The invite link was copied to your clipboard!', 'Great!', {
            duration: 3000,
          });
        } else {
          this.showLinkDialog(response.shareLink);
        }

        this.isGeneratingLink = false;
      },
      error: (err) => {
        console.error('Error generating share link:', err);
        this.snackBar.open('Failed to generate share link. Please try again.', 'Close', {
          duration: 4000,
        });
        this.isGeneratingLink = false;
      },
    });
  }

  togglePin(event?: Event) {
    event?.stopPropagation();
    const userId = this.userService.getLoggedInUserId();

    if (this.isPinning() || userId === null) {
      return;
    }

    const memoryId = Number(this.cardData().memory_id);
    this.isPinning.set(true);

    if (this.isPinned()) {
      this.pinnedMemoryService
        .deletePinnedMemory(userId, memoryId)
        .pipe(finalize(() => this.isPinning.set(false)))
        .subscribe({
          next: () => {
            this.pinOverride.set(false);
            this.snackBar.open('Memory unpinned', undefined, { duration: 2000 });
          },
          error: (err) => this.onPinError(err),
        });
      return;
    }

    this.pinnedMemoryService
      .pinMemoryIfPossible(userId, memoryId)
      .pipe(finalize(() => this.isPinning.set(false)))
      .subscribe({
        next: (result) => {
          if (result === 'limit-reached') {
            this.snackBar.open(
              `You can pin up to ${this.pinnedMemoryService.maxPins} memories. Unpin one first.`,
              'OK',
              { duration: 4000 }
            );
            return;
          }
          this.pinOverride.set(true);
          this.snackBar.open('Memory pinned to your profile', undefined, { duration: 2000 });
        },
        error: (err) => this.onPinError(err),
      });
  }

  private onPinError(err: unknown) {
    console.error('Error updating pinned memory:', err);
    this.snackBar.open('Could not update your pinned memories. Please try again.', 'Close', {
      duration: 4000,
    });
  }


  openGallery(event?: Event) {
    event?.stopPropagation();
    this.router.navigate(['/memory', this.cardData().memory_id, 'gallery']);
  }

  inviteToMemory(event?: Event) {
    event?.stopPropagation();
    // TODO: confirm and delete memory
  }

  private showLinkDialog(link: string) {
    const snackBarRef = this.snackBar.open(`Share link: ${link}`, 'Copy', { duration: 10000 });

    snackBarRef.onAction().subscribe(() => {
      this.clipboard.copy(link);
      this.snackBar.open('Link copied!', 'OK', { duration: 2000 });
    });
  }

  /** Formats like the mockup: "June 12–18, 2026". */
  formatDate(date: string | Date | null | undefined, end_date: string | Date | null | undefined): string {
    if (!date || !end_date) {
      return 'N/A';
    }

    const start = new Date(date);
    const end = new Date(end_date);
    const fmt = (d: Date, f: string) => this.datePipe.transform(d, f) ?? 'N/A';

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();
    const sameDay = sameMonth && start.getDate() === end.getDate();

    if (sameDay) {
      return fmt(start, 'MMMM d, y');
    }
    if (sameMonth) {
      return `${fmt(start, 'MMMM d')}–${fmt(end, 'd')}, ${fmt(end, 'y')}`;
    }
    if (sameYear) {
      return `${fmt(start, 'MMM d')} – ${fmt(end, 'MMM d')}, ${fmt(end, 'y')}`;
    }
    return `${fmt(start, 'MMM d, y')} – ${fmt(end, 'MMM d, y')}`;
  }
}