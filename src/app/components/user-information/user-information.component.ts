import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
// import { MockUserService } from '../../services/mocks/MockUserService';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.css']
})
export class UserInformationComponent implements OnInit {
  user: any;
  showEditForm = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    console.log('ngOnInit() was called');
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.userService.getUserByEmail('user2@example.com').subscribe(
      (data) => {
        this.user = data;
        console.log("data:", data);
      },
      (error: any) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  openEditForm(): void {
    // Implement logic to open the edit form
    // This might involve routing to another component or opening a dialog/modal
    // You can use Angular Material Dialog for this purpose
    // Example: this.dialog.open(EditFormComponent);
  }
}
