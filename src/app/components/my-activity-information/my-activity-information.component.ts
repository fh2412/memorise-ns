import { Component, Input } from '@angular/core';
import { MemoriseUser } from '../../models/userInterface.model';

@Component({
    selector: 'app-my-activity-information',
    templateUrl: './my-activity-information.component.html',
    styleUrl: './my-activity-information.component.scss',
    standalone: false
})
export class MyActivityInformationComponent {
  @Input() user!: MemoriseUser;
  navigateToUserActivities(): void {
    console.log("Placeholder")
  }
}
