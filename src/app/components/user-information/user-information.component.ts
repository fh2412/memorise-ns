import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../_dialogs/edit-user-dialog/edit-user-dialog.component';
import { ChangePasswordDialogComponent } from '../_dialogs/change-password-dialog/change-password-dialog.component';
import { FileUploadService } from '../../services/file-upload.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit {
  userdb: any;
  currentUser: any;
  showEditForm = true;

  constructor(private userService: UserService, 
    private afAuth: AngularFireAuth,  
    public dialog: MatDialog, 
    private fileUploadService: FileUploadService, private router: Router) {}

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
      width: '40%',
      data: {name: this.userdb.name, bio: this.userdb.bio, dob: this.userdb.formatted_dob, gender: this.userdb.gender, country: this.userdb.country, username: this.userdb.username},
    });
    // Subscribe to afterClosed event to handle any actions after the dialog closes
    dialogRef.componentInstance.updateUserData.subscribe((result: any) => {
      if (result) {
        this.userService.updateUser(this.userdb.user_id, result).subscribe(
          () => {
            this.userdb.name=result.name;
            this.userdb.bio=result.bio;
            this.userdb.gender=result.gender;
            this.userdb.formatted_dob=result.dob;
            this.userdb.country=result.country;
            this.userdb.username=result.username;

            dialogRef.close();
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
      width: '20%', // Adjust the width as needed
      enterAnimationDuration: '1500ms',

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

  async saveProfilePicUrlInDatabase(userId: string, profilePicUrl: string): Promise<void> {
    console.log(userId, profilePicUrl);
    await this.userService.updateUserProfilePic(userId, profilePicUrl)
      .subscribe(
        () => console.log('Profile picture URL saved in the database.'),
        (error) => {
          console.error('Error saving profile picture URL in the database:', error);
        }
      );
    location.reload();
  }

  navigateToUserProfile() {
    this.router.navigate([`/userprofile/${this.userdb.user_id}`]);
  }
}
