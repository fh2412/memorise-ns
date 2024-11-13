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
import { ManageFriendsService } from '../../services/friend-manage.service';
import { Memory } from '../../models/memoryInterface.model';
import { MemoriseUser } from '../../models/userInterface.model';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userId!: string;
  user!: MemoriseUser;
  loggedInUserId: string | null = null;

  buttonText: string = 'Edit Profile';
  pin_memories: Memory[] = [];
  all_memories: Memory[] = [];
  isUploading: boolean = false;

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private userService: UserService, private memoryService: MemoryService, private pinnedService: pinnedMemoryService, private _snackBar: MatSnackBar, private fileUploadService: FileUploadService, private datePipe: DatePipe, private manageFriendService: ManageFriendsService) {

  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') as string;
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.getPinnedMemories();
    this.getAllMemories();
    this.userService.getUser(this.userId).subscribe(
      (response) => {
        this.user = response;
      },
      (error) => {
        console.error('Error fetching user:', error);
        // Handle error, e.g., show an error message
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

  getMemoriesToDisplay(): Memory[] {
    return this.pinnedService.getPinnedMemoriesWithPlacholders(this.pin_memories);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  profileButtonClick(): void {
    this.openEditDialog();
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '40%',
      data: { name: this.user.name, bio: this.user.bio, dob: this.user.dob, gender: this.user.gender, country: this.user.country, username: this.user.username, instagram: this.user.instagram },
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
            this.user.instagram = result.instagram;
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
      await this.comparePinnedMemories(this.pin_memories, result);
    });
  }

  comparePinnedMemories(pinMemories: any[], result: any[]) {
    const pinMemorySet = new Set(pinMemories.map(memory => memory.memory_id)); // Set of IDs from pin_memories
    const resultSet = new Set(result.map(item => item.id)); // Set of IDs from result

    // Find IDs in pin_memories but not in result (for deletion)
    const deletedIds = [...pinMemorySet].filter(id => !resultSet.has(id));
    if (deletedIds.length) {
      console.log('Delete:', deletedIds.join(', '));
      deletedIds.forEach(id => {
        this.deletePinnedMemoryEntry(id);
      });
    }

    // Find IDs in result but not in pin_memories (for insertion)
    const insertedIds = [...resultSet].filter(id => !pinMemorySet.has(id));
    if (insertedIds.length) {
      console.log('Insert:', insertedIds.join(', '));
      insertedIds.forEach(id => {
        this.createPinnedMemoryEntry(id);
      });
    }
  }

  openPassowrdChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '20%', // Adjust the width as needed
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
      this.isUploading = true; // Start spinner
      this.fileUploadService.uploadProfilePicture(this.user.user_id, file).subscribe(
        (uploadProgress: number | undefined) => {
          // You can update the progress bar here if you want
          console.log(`Upload Progress: ${uploadProgress}%`);
        },
        error => {
          console.error('Error uploading profile picture:', error);
          this.isUploading = false; // Stop spinner on error
        },
        async () => {
          const downloadURL = await this.fileUploadService.getProfilePictureUrl(this.user.user_id);
          console.log('Profile picture uploaded successfully. URL:', downloadURL);

          // Save the downloadURL in your database
          this.saveProfilePicUrlInDatabase(this.user.user_id, downloadURL);
          this.isUploading = false; // Stop spinner after completion
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