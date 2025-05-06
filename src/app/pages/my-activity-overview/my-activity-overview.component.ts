import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../../services/activity.service';
import { firstValueFrom } from 'rxjs';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-my-activity-overview',
  standalone: false,
  templateUrl: './my-activity-overview.component.html',
  styleUrl: './my-activity-overview.component.scss'
})
export class MyActivityOverviewComponent implements OnInit {
  userId: string | null = null;
  userName = '';
  userActivityList: MemoriseUserActivity[] = [];

  constructor(private activityService: ActivityService, private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    this.userId = this.userService.getLoggedInUserId();
    this.userName = history.state.userName || 'Unknown';
    if(this.userId){
      this.userActivityList = await firstValueFrom(this.activityService.getUsersActivities(this.userId));
    }
  }
}
