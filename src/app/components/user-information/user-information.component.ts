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
      data: {name: this.currentUser.name, email: this.currentUser.email},
    });

    // Subscribe to afterClosed event to handle any actions after the dialog closes
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.currentUser = result;
    });
  }
}
