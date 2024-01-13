import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { FileUploadService } from '../../services/file-upload.service';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit {
  userdb: any;
  currentUser: any;
  showEditForm = true;

  constructor(private userService: UserService, private afAuth: AngularFireAuth,  public dialog: MatDialog, private fileUploadService: FileUploadService) {}

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
      width: '40%', // Adjust the width as needed
      data: {name: this.userdb.name, bio: this.userdb.bio, dob: this.userdb.formatted_dob, gender: this.userdb.gender, country: this.userdb.location},
    });
    console.log("userdb", this.userdb);
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
  openPassowrdChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '40%', // Adjust the width as needed
      data: {oldpw: 'test'},
    });
    // Subscribe to afterClosed event to handle any actions after the dialog closes
    dialogRef.componentInstance.updateUserPassword.subscribe((result: any) => {
      if (result) {
        console.log(result);
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      // Usage in a component or service
      this.fileUploadService.uploadProfilePicture(this.userdb.user_id, file).subscribe(
        (uploadProgress: number | undefined) => {
          console.log(`Upload Progress: ${uploadProgress}%`);
        },
        error => {
          console.error('Error uploading profile picture:', error);
        },
        async () => {
          const downloadURL = await this.fileUploadService.getProfilePictureUrl(this.userdb.user_id);
          console.log('Profile picture uploaded successfully. URL:', downloadURL);
          
          // Now, save the downloadURL in your database
          this.saveProfilePicUrlInDatabase(this.userdb.user_id, downloadURL);
        }
      );
    }
  }

  saveProfilePicUrlInDatabase(userId: string, profilePicUrl: string): void {
    // Assuming you have a user service to handle database operations
    this.userService.updateUserProfilePic(userId, profilePicUrl)
      .subscribe(
        () => console.log('Profile picture URL saved in the database.'),
        error => console.error('Error saving profile picture URL in the database:', error)
      );
    location.reload();
  }
}
