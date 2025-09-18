import { Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
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
  @Input() userId: string | null = null;
  @Input() fullComponent = true;
  @Output() activitySelected = new EventEmitter<number>();
  
  //activities: MemoriseUserActivity[] | null = null;
  //displayActivities: MemoriseUserActivity[] = [];
  showAll = false;
  canShowMore = false;
  private readonly maxInitialEntries = 5;
  emptyText = "There are no bookmarked Activities. Just add one by clicking the bookmark icon";

  constructor(private router: Router, private snackBar: MatSnackBar, private bookmarkService: BookmarkService) { }

  activities = this.bookmarkService.bookmarkedActivities;
  displayActivities = computed(() => this.activities()); 

  ngOnInit(): void {
    if(!this.fullComponent){
      this.emptyText = "You haven’t bookmarked any activities yet. Visit the Activity page to bookmark some, and they’ll show up here.";
      //Loading Bookmarks here because for the activity page it gets loaded in activities.component.ts
      if(this.userId){
      this.bookmarkService.getBookmarkedActivities(this.userId).subscribe(
        (response) => {
          this.bookmarkService.setBookmarks(response);
        },
        (error) => {
          console.log('Error fetching bookmarked Activities', error);
        }
      );
    };
    }
  }


  updateDisplayedActivities(): void {
    if (this.activities) {
      if (this.showAll || this.activities.length <= this.maxInitialEntries) {
        this.displayActivities = computed(() => this.activities());
      } else {
        this.displayActivities = computed(() => this.activities().slice(0, this.maxInitialEntries));
      }
    }
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.updateDisplayedActivities();
  }

  deleteBookmark(activityId: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.activities() && this.userId) {
      this.bookmarkService.removeBookmark(this.userId, activityId).subscribe({
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
    if (this.fullComponent) {
      this.router.navigate(['activity/details', activityId]);
    } else {
      this.activitySelected.emit(activityId);
    }
  }
}
