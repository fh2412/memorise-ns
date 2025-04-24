// activity-card.component.ts
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { BookmarkService } from '../../services/bookmarking.service';
import { UserService } from '../../services/userService';

export interface ActivityTag {
  name: string;
  color?: string;
}

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrl: './activity-card.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatChipsModule
  ],
  animations: [
    trigger('bookmarkAnimation', [
      transition('false => true', [
        animate(
          '600ms ease-out',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.4) rotate(20deg)', offset: 0.3 }),
            style({ transform: 'scale(1) rotate(0deg)', offset: 0.6 }),
            style({ transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
      transition('true => false', [
        animate(
          '300ms ease-in',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(0.8)', opacity: 0.5, offset: 0.5 }),
            style({ transform: 'scale(1)', opacity: 1, offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class ActivityCardComponent {
  @Input() activity!: MemoriseUserActivity;
  isBookmarked = false;
  loggedInUserId: string | null = null;

  constructor(private router: Router, private userService: UserService, private bookmarkService: BookmarkService) { }

  viewDetails() {
    this.router.navigate(['activity/details/', this.activity.activityId]);
  }

  toggleBookmark(event: Event) {
    event.stopPropagation();

    this.loggedInUserId = this.userService.getLoggedInUserId();

    if (this.loggedInUserId) {
      this.bookmarkService.toggleBookmark(this.loggedInUserId, this.activity.activityId, this.isBookmarked)
        .subscribe(
          () => {
            this.isBookmarked = !this.isBookmarked;
          },
          error => {
            console.error('Error toggling bookmark', error);
          }
        );
    }
  }
}
