import { Component } from '@angular/core';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-my-activity-information',
  templateUrl: './my-activity-information.component.html',
  styleUrl: './my-activity-information.component.scss'
})
export class MyActivityInformationComponent {
  user: any;
  loggedInUserId: any;
  constructor(private userService: UserService) {

  }
  
  async ngOnInit() {
    const userId = this.userService.getLoggedInUserId();
    this.loggedInUserId = this.userService.getLoggedInUserId();
    if(userId){
      this.userService.getUser(userId).subscribe(
        (response) => {
          this.user = response;
        },
        (error) => {
          console.error('Error fetching user:', error);
        }
      );
    }
  }
  getUserInfo(): void {
  }
  navigateToUserActivities(): void{
  }
}
