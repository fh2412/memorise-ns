import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-my-activity-information',
  templateUrl: './my-activity-information.component.html',
  styleUrl: './my-activity-information.component.scss'
})
export class MyActivityInformationComponent {
  @Input() user: any;
  navigateToUserActivities(): void{
  }
}
