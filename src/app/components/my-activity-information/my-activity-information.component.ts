import { Component } from '@angular/core';

@Component({
  selector: 'app-my-activity-information',
  templateUrl: './my-activity-information.component.html',
  styleUrl: './my-activity-information.component.scss'
})
export class MyActivityInformationComponent {
  
  userdb = '4';
  
  ngOnInit(): void {
    this.getUserInfo();
  }
  getUserInfo(): void {
  }
  navigateToUserActivities(): void{
  }
}
