import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ActivityService } from '../../services/activity.service';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { firstValueFrom } from 'rxjs';
import { MemoriseUser } from '../../models/userInterface.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bockmarked-activities',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './bockmarked-activities.component.html',
  styleUrl: './bockmarked-activities.component.scss'
})
export class BockmarkedActivitiesComponent implements OnInit {
  @Input() user!: MemoriseUser;
  activities: MemoriseUserActivity[] | null = null;

  constructor(private activityService: ActivityService) { }

  ngOnInit(): void {
    this.getBookmarks();
  }

  async getBookmarks() {
    this.activities = await firstValueFrom(this.activityService.getBookmarkedActivities(this.user.user_id));
    console.log("Bookmarks: ", this.activities);
  }
}
