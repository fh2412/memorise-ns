import { Component, OnInit } from '@angular/core';
import { ActivityTag } from '../../components/activity-card/activity-card.component';
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

  hikingTags: ActivityTag[] = [
    { name: 'Adventure', color: '#4CAF50' },
    { name: 'Nature', color: '#2196F3' },
    { name: 'Moderate', color: '#FF9800' }
  ];

  climbingTags: ActivityTag[] = [
    { name: 'Sport', color: '#9C27B0' },
    { name: 'Beginner', color: '#4CAF50' },
    { name: 'Indoor', color: '#607D8B' }
  ];

  constructor(private activityService: ActivityService, private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    this.userId = this.userService.getLoggedInUserId();
    this.userName = history.state.userName || 'Unknown';
    if(this.userId){
      this.userActivityList = await firstValueFrom(this.activityService.getUsersActivities(this.userId));
    }
    console.log(this.userActivityList);
  }
}
