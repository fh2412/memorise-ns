import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ActivityService } from '../../services/activity.service';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { firstValueFrom } from 'rxjs';
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

  constructor(private router: Router, private activityService: ActivityService, private snackBar: MatSnackBar, private bookmarkService: BookmarkService) { }

  ngOnInit(): void {
    this.getBookmarks();
  }

  async getBookmarks() {
    this.activities = await firstValueFrom(this.activityService.getBookmarkedActivities(this.user.user_id));
    console.log(this.activities);
  }

  deleteBookmark(activityId: number) {
    if (this.activities) {
      this.activities = this.activities.filter(activity => activity.activityId !== activityId);
      this.bookmarkService.removeBookmark(this.user.user_id, activityId).subscribe({
        next: () => {
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
