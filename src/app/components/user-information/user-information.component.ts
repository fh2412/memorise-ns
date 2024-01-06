import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.css']
})
export class UserInformationComponent implements OnInit {
  userdb: any;
  currentUser: any;
  showEditForm = true;

  constructor(private userService: UserService, private afAuth: AngularFireAuth,  public dialog: MatDialog) {}

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

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '400px', // Adjust the width as needed
      data: {name: this.userdb.name, email: this.userdb.email, dob: this.userdb.formatted_dob, gender: this.userdb.gender, country: this.userdb.location},
    });
    // Subscribe to afterClosed event to handle any actions after the dialog closes
    dialogRef.componentInstance.updateUserData.subscribe((result: any) => {
      if (result) {
        console.log(result);
        this.userService.updateUser(this.userdb.user_id, result).subscribe(
          (response) => {
            console.log('User updated successfully:', response);
          },
          (error) => {
            console.error('Error updating user:', error);
            // Handle error scenarios if needed
          }
        );
      }
    });
  }
}
