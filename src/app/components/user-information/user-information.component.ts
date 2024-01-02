import { Component, OnInit } from '@angular/core';
// import { UserService } from '../../services/userService';
import { MockUserService } from '../../services/mocks/MockUserService';
import {MatCardModule} from '@angular/material/card';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.css']
})
export class UserInformationComponent implements OnInit {
  user: any; // Define your user data structure here
  showEditForm = false;

  constructor(private userService: MockUserService) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.userService.getUser().subscribe(
      (userData: any) => {
        this.user = userData;
        // Check if any of the user information is missing
        if (!userData.name || !userData.age || !userData.gender || !userData.location) {
          this.showEditForm = true;
        }
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
