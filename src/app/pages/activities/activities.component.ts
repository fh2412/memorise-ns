import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { companyService } from '../../services/company.service';
import { MemoriseUser } from '../../models/userInterface.model';
import { MemoriseCompany } from '../../models/company.model';
import { Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { MemoriseUserActivity } from '../../models/activityInterface.model';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
  standalone: false
})
export class ActivitiesComponent implements OnInit {
  user!: MemoriseUser;
  loggedInUserId: string | null = null;
  activities: MemoriseUserActivity[] = [];
  company!: MemoriseCompany;

  constructor(private router: Router, private userService: UserService, private activityService: ActivityService, private companyService: companyService) { }
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
    console.log("GET init activities from user: ", this.loggedInUserId);
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

  addActivity() {
    this.router.navigate(['activity/create']);
  };
}
