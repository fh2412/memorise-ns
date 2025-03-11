import { Component, Input, OnInit } from '@angular/core';
import { MemoriseUser } from '../../models/userInterface.model';
import { Activity } from '../quick-activity-autocomplete/quick-activity-autocomplete.component';

@Component({
    selector: 'app-my-activity-information',
    templateUrl: './my-activity-information.component.html',
    styleUrl: './my-activity-information.component.scss',
    standalone: false
})
export class MyActivityInformationComponent implements OnInit {
  @Input() user!: MemoriseUser;

  activities: Activity[] = [{ id: 1, icon: '🏃', name: 'Running', genre: 'Sport' }];

  ngOnInit(): void {
    this.activities.push(
      { id: 2, icon: '🎸', name: 'Playing Guitar', genre: 'Music' },
      { id: 3, icon: '📖', name: 'Reading', genre: 'Education' }
    );
    this.getActivityStats();
  }

  getActivityStats() {
    throw new Error('Method not implemented.');
  }

  navigateToUserActivities(): void {
    throw new Error('Method not implemented.');
  }
}
