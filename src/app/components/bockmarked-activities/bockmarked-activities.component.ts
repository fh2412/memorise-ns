import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { MemoriseUser } from '../../models/userInterface.model';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookmarkService } from '../../services/bookmarking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bockmarked-activities',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    NgOptimizedImage
  ],
  templateUrl: './bockmarked-activities.component.html',
  styleUrl: './bockmarked-activities.component.scss'
})
export class BockmarkedActivitiesComponent implements OnInit {
  @Input() user!: MemoriseUser;
  activities: MemoriseUserActivity[] | null = null;
  displayActivities: MemoriseUserActivity[] = [];
  showAll = false;
  canShowMore = false;
  private readonly maxInitialEntries = 5;

  constructor(private router: Router, private snackBar: MatSnackBar, private bookmarkService: BookmarkService) { }

  ngOnInit(): void {
    this.getBookmarks();
  }

  async getBookmarks() {
    this.bookmarkService.getBookmarkedActivities(this.user.user_id).subscribe({
      next: (result) => {
        this.activities = result;
        this.updateDisplayedActivities();
        this.canShowMore = this.activities.length > this.maxInitialEntries;
        this.bookmarkService.setBookmarkedActivities(result);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  updateDisplayedActivities(): void {
    if (this.activities) {
      if (this.showAll || this.activities.length <= this.maxInitialEntries) {
        this.displayActivities = [...this.activities];
      } else {
        this.displayActivities = this.activities.slice(0, this.maxInitialEntries);
      }
    }
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  deleteBookmark(activityId: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.activities) {
      this.activities = this.activities.filter(activity => activity.activityId !== activityId);
      this.bookmarkService.removeBookmark(this.user.user_id, activityId).subscribe({
        next: () => {
          this.updateDisplayedActivities();
          this.snackBar.open('Bookmark was removed!', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        },
        error: () => {
          this.snackBar.open('Error removing Bookmark', 'Close', { duration: 3000, verticalPosition: 'bottom' });
        }
      })
    }
  }

  viewDetails(activityId: number) {
    this.router.navigate(['activity/details/', activityId]);
  }
}
