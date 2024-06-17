import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmationDialogData } from '../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../services/userService';
import { FriendsService } from '../../services/friends.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditUserDialogComponent } from '../../components/_dialogs/edit-user-dialog/edit-user-dialog.component';
import { ChangePasswordDialogComponent } from '../../components/_dialogs/change-password-dialog/change-password-dialog.component';
import { FileUploadService } from '../../services/file-upload.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userId: any;
  user: any;
  loggedInUserId: any;
  memories = [
    { title: 'Heading Text', description: 'This is the description of the memory in a short', type: 'Vacation', stars: 8 },
    { title: 'Heading Text', description: 'This is the description of the memory in a short', type: 'Vacation', stars: 8 },
    { title: 'Heading Text', description: 'This is the description of the memory in a short', type: 'Vacation', stars: 8 },
    { title: 'Heading Text', description: 'This is the description of the memory in a short', type: 'Vacation', stars: 8 }
  ];

  constructor(private route: ActivatedRoute, private router: Router, public dialog: MatDialog, private userService: UserService, private friedService: FriendsService, private _snackBar: MatSnackBar, private fileUploadService: FileUploadService, private datePipe: DatePipe,) {
    
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.loggedInUserId = this.userService.getLoggedInUserId();

    this.userService.getUser(this.userId).subscribe(
      (response) => {
        this.user = response;
        this.user.dob = this.datePipe.transform(this.user.dob, 'dd/MM/yyyy');
        if (this.router.url.startsWith('/invite')) {
          this.checkFriendshipStatus();
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
        // Handle error, e.g., show an error message
      }
    );
  }

  showConfirmDialog(title: string, message: string) {
    const confirmationData: ConfirmationDialogData = {
      title: title,
      message: message
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: confirmationData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && title == "Offer Friendship") {
        this.friedService.sendFriendRequest( this.loggedInUserId, this.userId).subscribe(
          response => {
            console.log('Friend request sent successfully', response);
          },
          error => {
            console.error('Error sending friend request', error);
          }
        );
      }
      else if (result && title == "Accept Friend Request") {
        this.friedService.acceptFriendRequest( this.loggedInUserId, this.userId).subscribe(
          response => {
            console.log('Friend added', response);
          },
          error => {
            console.error('Error sending friend request', error);
          }
        );
      }
    });
  }

  checkFriendshipStatus(){
    this.friedService.getFriendsStatus(this.loggedInUserId, this.userId).subscribe(
      (response) => {
        const result = response.toString();
        console.log(response);
        if(result == 'empty'){
          this.showConfirmDialog('Offer Friendship', 'Do you want to add ' + this.user.name + ' as your friend?');
        }
        else if(result == 'waiting'){
          this.showConfirmDialog('Accept Friend Request', 'Do you want to accept ' + this.user.name + ' as your friend?');
        }
        else if(result == 'accepted'){
          this.openSnackBar('You guys are already friends!', 'Great!');
        }
        else if(result == 'pending'){
          this.openSnackBar('You already send this user a friend request!', 'Got it!');
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '40%',
      data: {name: this.user.name, bio: this.user.bio, dob: this.user.dob, gender: this.user.gender, country: this.user.country, username: this.user.username},
    });
    // Subscribe to afterClosed event to handle any actions after the dialog closes
    dialogRef.componentInstance.updateUserData.subscribe((result: any) => {
      if (result) {
        this.userService.updateUser(this.user.user_id, result).subscribe(
          () => {
            this.user.name=result.name;
            this.user.bio=result.bio;
            this.user.gender=result.gender;
            this.user.formatted_dob=result.dob;
            this.user.country=result.country;
            this.user.username=result.username;

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
      this.fileUploadService.uploadProfilePicture(this.user.user_id, file).subscribe(
        (uploadProgress: number | undefined) => {
          console.log(`Upload Progress: ${uploadProgress}%`);
        },
        error => {
          console.error('Error uploading profile picture:', error);
        },
        async () => {
          const downloadURL = await this.fileUploadService.getProfilePictureUrl(this.user.user_id);
          console.log('Profile picture uploaded successfully. URL:', downloadURL);
          
          // Now, save the downloadURL in your database
          this.saveProfilePicUrlInDatabase(this.user.user_id, downloadURL);
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
}