import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '@services/userService';
import { companyService } from '@services/company.service';
import { MemoriseUser } from '@models/userInterface.model';
import { MemoriseCompany } from '@models/company.model';
import { Router } from '@angular/router';
import { ActivityService } from '@services/activity.service';
import { MemoriseUserActivity } from '@models/activityInterface.model';
import { BookmarkService } from '@services/bookmarking.service';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
  standalone: false
})
export class ActivitiesComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private activityService = inject(ActivityService);
  private companyService = inject(companyService);
  private bookmarkService = inject(BookmarkService);

  user!: MemoriseUser;
  loggedInUserId: string | null = null;
  activities: MemoriseUserActivity[] = [];
  company!: MemoriseCompany;
  async ngOnInit() {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    if (this.loggedInUserId) {
      this.userService.getUser(this.loggedInUserId).subscribe(
        (response) => {
          this.user = response;
          this.getInitActivities();
          if (this.user.company_id) {
            this.getCompany();
          }
          this.loadBookmarks();
        },
        (error) => {
          console.error('Error fetching user:', error);
        }
      );
    }
  }

  getCompany(): void {
    if (this.loggedInUserId != null) {
      this.companyService.getUserCompany(this.loggedInUserId).subscribe(
        (response) => {
          this.company = response;
        },
        (error) => {
          console.log('Error fetching compnay', error);
        }
      );
    }
  }

  getInitActivities(): void {
    if (this.loggedInUserId != null) {
      this.activityService.getSugggestedActivities(this.loggedInUserId).subscribe(
        (response) => {
          this.activities = response;
        },
        (error) => {
          console.log('Error fetching compnay', error);
        }
      );
    }
  }

  private async loadBookmarks(): Promise<void> {
    if(this.loggedInUserId){
      this.bookmarkService.getBookmarkedActivities(this.loggedInUserId).subscribe(
        (response) => {
          this.bookmarkService.setBookmarks(response);
        },
        (error) => {
          console.log('Error fetching bookmarked Activities', error);
        }
      );
    };
  }

  addActivity() {
    this.router.navigate(['activity/create']);
  };
}
