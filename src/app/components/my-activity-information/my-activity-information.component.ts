import { Component, Input, OnInit } from '@angular/core';
import { MemoriseUser } from '../../models/userInterface.model';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivityService } from '../../services/activity.service';
import { firstValueFrom } from 'rxjs';
import { ActivityStats } from '../../models/activityInterface.model';

@Component({
    selector: 'app-my-activity-information',
    templateUrl: './my-activity-information.component.html',
    styleUrl: './my-activity-information.component.scss',
    imports: [
      MatCardModule,
      MatButtonModule,
    ]
})
export class MyActivityInformationComponent implements OnInit {
  @Input() user!: MemoriseUser;
  stats: ActivityStats | null = null;

  constructor(private router: Router, private activityService: ActivityService){}


  ngOnInit(): void {
    this.getActivityStats();
  }

  async getActivityStats() {
    this.stats = await firstValueFrom(this.activityService.getActivityStats(this.user.user_id));
    console.log("stats: ",this.stats);
  }

  navigateMyActivities() {
    this.router.navigate(['activity/overview/', this.user.user_id], {
      state: { userName: this.user.name }
    });
  }
}
