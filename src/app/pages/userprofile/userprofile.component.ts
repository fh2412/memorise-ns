import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/userService';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditUserDialogComponent } from '../../components/_dialogs/edit-user-dialog/edit-user-dialog.component';
import { ChangePasswordDialogComponent } from '../../components/_dialogs/change-password-dialog/change-password-dialog.component';
import { FileUploadService } from '../../services/file-upload.service';
import { PinnedDialogComponent } from '../../components/_dialogs/pinned-dialog/pinned-dialog.component';
import { MemoryService } from '../../services/memory.service';
import { Memory } from '../../models/memoryInterface.model';
import { MemoriseUser } from '../../models/userInterface.model';
import { finalize } from 'rxjs/operators';
import { PinnedMemoryService } from '../../services/pinnedMemorService';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userId!: string;
  user!: MemoriseUser;
  loggedInUserId: string | null = null;
  pinnedMemories: Memory[] = [];
  allMemories: Memory[] = [];
  isUploading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private userService: UserService,
    private memoryService: MemoryService,
    private pinnedService: PinnedMemoryService,
    private _snackBar: MatSnackBar,
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') as string;
    this.loggedInUserId = this.userService.getLoggedInUserId();
    this.initializeUserProfile();
  }

  initializeUserProfile() {
    this.fetchUser();
    this.getPinnedMemories();
    this.getAllMemories();
  }

  fetchUser() {
    this.userService.getUser(this.userId).subscribe(
      (response) => (this.user = response),
      (error) => {
        console.error('Error fetching user:', error);
        this.openSnackBar('Error fetching user information.', 'Close');
      }
    );
  }

  getPinnedMemories() {
    this.pinnedService.getPinnedMemories(this.userId).subscribe(
      (memories) => (this.pinnedMemories = memories),
      (error) => {
        console.error('Error fetching pinned memories:', error);
        this.openSnackBar('Error fetching pinned memories.', 'Close');
      }
    );
  }

  createPinnedMemoryEntry(memoryId: number) {
    this.pinnedService.createPinnedMemory(this.userId, memoryId).subscribe(
      () => {
        console.log('Pinned memory added successfully!');
        this.getPinnedMemories(); // Refresh pinned memories
      },
      (error: Error) => {
        console.error('Error adding pinned memory:', error);
        this.openSnackBar('Error adding pinned memory.', 'Close');
      }
    );
  }

  deletePinnedMemoryEntry(memoryIdToDelete: number) {
    this.pinnedService.deletePinnedMemory(this.userId, memoryIdToDelete).subscribe(
      () => {
        console.log('Pinned memory removed successfully!');
        this.getPinnedMemories(); // Refresh pinned memories
      },
      (error: Error) => {
        console.error('Error removing pinned memory:', error);
        this.openSnackBar('Error removing pinned memory.', 'Close');
      }
    );
  }

  getAllMemories() {
    this.memoryService.getAllMemories(this.userId).subscribe(
      (memories) => (this.allMemories = memories),
      (error) => {
        console.error('Error fetching all memories:', error);
        this.openSnackBar('Error fetching all memories.', 'Close');
      }
    );
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '40%',
      data: { ...this.user },
    });
    dialogRef.componentInstance.updateUserData.subscribe((result: any) => {
      if (result) {
        this.userService.updateUser(this.user.user_id, result).subscribe(
          () => {
            Object.assign(this.user, result); // Update user object
            this.openSnackBar('Profile updated successfully.', 'Close');
          },
          (error) => {
            console.error('Error updating user:', error);
            this.openSnackBar('Error updating profile.', 'Close');
          }
        );
      }
    });
  }

  openPinsDialog(): void {
    const dialogRef = this.dialog.open(PinnedDialogComponent, {
      width: '40%',
      data: { memories: this.allMemories, pinned: this.pinnedMemories },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.comparePinnedMemories(this.pinnedMemories, result);
      }
    });
  }

  comparePinnedMemories(pinMemories: any[], result: any[]) {
    const pinMemoryIds = new Set(pinMemories.map(memory => memory.memory_id));
    const resultIds = new Set(result.map(item => item.id));

    // Handle deletion: IDs in pin_memories but not in result
    const deletedIds = Array.from(pinMemoryIds).filter(id => !resultIds.has(id));
    deletedIds.forEach(id => this.deletePinnedMemoryEntry(id));

    // Handle insertion: IDs in result but not in pin_memories
    const insertedIds = Array.from(resultIds).filter(id => !pinMemoryIds.has(id));
    insertedIds.forEach(id => this.createPinnedMemoryEntry(id));
  }


  openPasswordChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '20%',
    });
    dialogRef.componentInstance.updateUserPassword.subscribe((result: any) => {
      if (result) {
        // Handle password change logic
        console.log('Password changed successfully');
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.fileUploadService.uploadProfilePicture(this.user.user_id, file)
        .pipe(finalize(() => (this.isUploading = false)))
        .subscribe(
          (uploadProgress) => console.log(`Upload Progress: ${uploadProgress}%`),
          (error) => {
            console.error('Error uploading profile picture:', error);
            this.openSnackBar('Error uploading profile picture.', 'Close');
          },
          async () => {
            const downloadURL = await this.fileUploadService.getProfilePictureUrl(this.user.user_id);
            this.saveProfilePicUrlInDatabase(downloadURL);
          }
        );
    }
  }

  saveProfilePicUrlInDatabase(profilePicUrl: string) {
    this.userService.updateUserProfilePic(this.user.user_id, profilePicUrl).subscribe(
      () => {
        this.user.profilepic = profilePicUrl; // Update user's profile picture in UI
        this.openSnackBar('Profile picture updated successfully.', 'Close');
      },
      (error) => {
        console.error('Error saving profile picture URL in the database:', error);
        this.openSnackBar('Error updating profile picture.', 'Close');
      }
    );
  }

  getMemoriesToDisplay(): Memory[] {
    return this.pinnedService.getPinnedMemoriesWithPlacholders(this.pinnedMemories);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }
}
