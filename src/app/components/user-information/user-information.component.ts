import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// import { MockUserService } from '../../services/mocks/MockUserService';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.css']
})
export class UserInformationComponent implements OnInit {
  userdb: any;
  currentUser: any;
  showEditForm = true;

  constructor(private userService: UserService, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.afAuth.authState.subscribe(user => {
        this.currentUser = user;
        this.userService.getUserByEmail(this.currentUser.email).subscribe(
          (data) => {
            this.userdb = data;
          },
          (error: any) => {
            console.error('Error fetching user data:', error);
          }
        );
    });
  }

  openEditForm(): void {
    // Implement logic to open the edit form
    // This might involve routing to another component or opening a dialog/modal
    // You can use Angular Material Dialog for this purpose
    // Example: this.dialog.open(EditFormComponent);
  }
}
