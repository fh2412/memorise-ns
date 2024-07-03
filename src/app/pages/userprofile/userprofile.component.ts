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
import { PinnedDialogComponent } from '../../components/_dialogs/pinned-dialog/pinned-dialog.component';
import { MemoryService } from '../../services/memory.service';
import { pinnedMemoryService } from '../../services/pinnedMemorService';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userId: any;
  user: any;
  loggedInUserId: any;
  buttonText: string = 'Edit Profile';
  pin_memories = [
    { title: 'Heading Text', description: 'This is the description of the memory in a short', type: 'Vacation', stars: 8, memory_id: 0 },
  ];
  all_memories = [];

  constructor(private route: ActivatedRoute, private router: Router, public dialog: MatDialog, private userService: UserService, private memoryService: MemoryService, private pinnedService: pinnedMemoryService, private friedService: FriendsService, private _snackBar: MatSnackBar, private fileUploadService: FileUploadService, private datePipe: DatePipe,) {

  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.getPinnedMemories();
    this.getAllMemories();
    this.userService.getUser(this.userId).subscribe(
      (response) => {
        this.user = response;
        this.user.formatted_dob = this.datePipe.transform(this.user.dob, 'dd/MM/yyyy');
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
        this.friedService.sendFriendRequest(this.loggedInUserId, this.userId).subscribe(
          response => {
            console.log('Friend request sent successfully', response);
          },
          error => {
            console.error('Error sending friend request', error);
          }
        );
      }
      else if (result && title == "Accept Friend Request") {
        this.friedService.acceptFriendRequest(this.loggedInUserId, this.userId).subscribe(
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

  checkFriendshipStatus() {
    this.friedService.getFriendsStatus(this.loggedInUserId, this.userId).subscribe(
      (response) => {
        const result = response.toString();
        console.log(response);
        if (result == 'empty') {
          this.showConfirmDialog('Offer Friendship', 'Do you want to add ' + this.user.name + ' as your friend?');
        }
        else if (result == 'waiting') {
          this.showConfirmDialog('Accept Friend Request', 'Do you want to accept ' + this.user.name + ' as your friend?');
        }
        else if (result == 'accepted') {
          this.openSnackBar('You guys are already friends!', 'Great!');
        }
        else if (result == 'pending') {
          this.openSnackBar('You already send this user a friend request!', 'Got it!');
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
      }
    );

  }

  getPinnedMemories() {
    this.pinnedService.getPinnedMemories(this.userId)
      .subscribe(memories => {
        this.pin_memories = memories;
      }, error => {
        console.error('Error fetching favorite memories:', error);
      });
  }

  updatePinnedMemory(memoryIdToUpdate: number, updatedMemoryId: number) {
    this.pinnedService.updatePinnedMemory(this.userId, memoryIdToUpdate, updatedMemoryId)
      .subscribe(
        response => {
          // Handle successful update
          console.log('Favorite memory updated successfully!');
          // Update UI or data as needed
        },
        error => {
          console.error('Error updating favorite memory:', error);
          // Handle errors (e.g., display error message to user)
        }
      );
  }

  createPinnedMemoryEntry(memoryId: number) {
    this.pinnedService.createPinnedMemory(this.userId, memoryId)
      .subscribe(
        response => {
          console.log('Favorite memory created successfully!');
          // Update UI or data as needed
          // (e.g., fetch updated pinned memories)
        },
        error => {
          console.error('Error creating favorite memory:', error);
          // Handle errors (e.g., display error message to user)
        }
      );
  }

  deletePinnedMemoryEntry(memoryIdToDelete: number) {
    this.pinnedService.deletePinnedMemory(this.userId, memoryIdToDelete)
      .subscribe(
        response => {
          console.log('Favorite memory deleted successfully!');
          // Update UI or data as needed
          // (e.g., remove memory from displayed list)
        },
        error => {
          console.error('Error deleting favorite memory:', error);
          // Handle errors (e.g., display error message to user)
        }
      );
  }


  getAllMemories() {
    this.memoryService.getAllMemories(this.userId)
      .subscribe(memories => {
        this.all_memories = memories;
      }, error => {
        console.error('Error fetching favorite memories:', error);
      });
  }

  getMemoriesToDisplay() {
    const displayedMemories = [...this.pin_memories];
    // Fill remaining slots with placeholder objects
    for (let i = displayedMemories.length; i < 4; i++) {
      displayedMemories.push({ title: '', description: '', type: '', stars: 0, memory_id: 0 });
    }
    return displayedMemories;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '40%',
      data: { name: this.user.name, bio: this.user.bio, dob: this.user.dob, gender: this.user.gender, country: this.user.country, username: this.user.username },
    });
    // Subscribe to afterClosed event to handle any actions after the dialog closes
    dialogRef.componentInstance.updateUserData.subscribe((result: any) => {
      if (result) {
        this.userService.updateUser(this.user.user_id, result).subscribe(
          () => {
            this.user.name = result.name;
            this.user.bio = result.bio;
            this.user.gender = result.gender;
            this.user.formatted_dob = result.dob;
            this.user.country = result.country;
            this.user.username = result.username;

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

  openPinsDialog(): void {
    const dialogRef = this.dialog.open(PinnedDialogComponent, {
      width: '40%',
      data: { memories: this.all_memories, pinned: this.pin_memories },
    });
    dialogRef.afterClosed().subscribe(async result => {
      console.log('Dialog was closed with:', result);
      const updatePromises = [];
      if (result.length >= this.pin_memories.length) {
        for (let index = 0; index < result.length; index++) {
          if (index < this.pin_memories.length) {
            if (this.pin_memories[index].memory_id != result[index].id) {
              console.log("update", this.pin_memories[index].memory_id, "to", result[index].id);
              updatePromises.push(this.updatePinnedMemory(this.pin_memories[index].memory_id, result[index].id));
              //await this.updatePinnedMemory(this.pin_memories[index].memory_id, result[index].id);
            }
            else {
              console.log("skipped: ", result[index]);
            }
          }
          else {
            console.log("insert", result[index]);
            //await this.createPinnedMemoryEntry(result[index].id);
            updatePromises.push(this.createPinnedMemoryEntry(result[index].id));
          }
        }
      }
      else{
        console.log("less!");
        for (let index = 0; index < this.pin_memories.length; index++) {
          if (index < result.length) {
            if (this.pin_memories[index].memory_id != result[index].id) {
              console.log("update", this.pin_memories[index].memory_id, "to", result[index]);
              updatePromises.push(this.updatePinnedMemory(this.pin_memories[index].memory_id, result[index].id));
              //await this.updatePinnedMemory(this.pin_memories[index].memory_id, result[index].id);
            }
            else {
              console.log("skipped: ", result[index]);
            }
          }
          else {
            console.log("delete", this.pin_memories[index].memory_id);
            updatePromises.push(this.deletePinnedMemoryEntry(this.pin_memories[index].memory_id));
            //await this.deletePinnedMemoryEntry(this.pin_memories[index].memory_id);
          }
        }
      }
      if (updatePromises.length > 0) {
        Promise.all(updatePromises)
          .then(() => {
            // All updates/inserts/deletes are complete
            console.log('All pinned memory updates finished!');
            // Update UI or perform other actions after successful completion
          })
          .catch(error => {
            console.error('Error during pinned memory updates:', error);
            // Handle errors gracefully
          });
      } else {
        console.log('No changes to pinned memories detected.');
        // Handle the case where no updates were needed
      }
      
    });
  }

  openPassowrdChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '20%', // Adjust the width as needed
      enterAnimationDuration: '1500ms',

      data: { oldpw: 'test' },
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