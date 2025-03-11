import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../services/userService';
import { FileUploadService } from '../../services/file-upload.service';
import { MemoryService } from '../../services/memory.service';
import { PinnedMemoryService } from '../../services/pinnedMemorService';

import { EditUserDialogComponent } from '../../components/_dialogs/edit-user-dialog/edit-user-dialog.component';
import { ChangePasswordDialogComponent } from '../../components/_dialogs/change-password-dialog/change-password-dialog.component';
import { PinnedDialogComponent, PinnedMemory } from '../../components/_dialogs/pinned-dialog/pinned-dialog.component';

import { Memory } from '../../models/memoryInterface.model';
import { MemoriseUser } from '../../models/userInterface.model';

@Component({
    selector: 'app-userprofile',
    templateUrl: './userprofile.component.html',
    styleUrls: ['./userprofile.component.scss'],
    standalone: false
})
export class UserProfileComponent implements OnInit {
  userId!: string;
  user!: MemoriseUser;
  loggedInUserId: string | null = null;
  pinnedMemories: Memory[] = [];
  allMemories: Memory[] = [];
  isUploading = false;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private memoryService: MemoryService,
    private pinnedService: PinnedMemoryService,
    private fileUploadService: FileUploadService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userId = this.route.snapshot.paramMap.get('userId') as string;
    this.loggedInUserId = this.userService.getLoggedInUserId();
    await this.initializeUserProfile();
  }


  /** Initializes the user profile by fetching data. */
  private initializeUserProfile(): void {
    this.fetchUser();
    this.getPinnedMemories();
    this.getAllMemories();
  }

  /** Fetches user data. */
  private fetchUser(): void {
    this.userService.getUser(this.userId).subscribe(
      (response) => (this.user = response),
      () => this.handleError('Error fetching user information.')
    );
  }

  /** Retrieves pinned memories for the user. */
  private getPinnedMemories(): void {
    this.pinnedService.getPinnedMemories(this.userId).subscribe(
      (memories) => (this.pinnedMemories = memories),
      () => this.handleError('Error fetching pinned memories.')
    );
  }

  /** Retrieves all memories for the user. */
  private getAllMemories(): void {
    this.memoryService.getAllMemories(this.userId).subscribe(
      (memories) => (this.allMemories = memories),
      () => this.handleError('Error fetching all memories.')
    );
  }

  /** Adds a memory to pinned memories. */
  private createPinnedMemory(memoryId: number): void {
    this.pinnedService.createPinnedMemory(this.userId, memoryId).subscribe(
      () => this.getPinnedMemories(),
      () => this.handleError('Error adding pinned memory.')
    );
  }

  /** Removes a memory from pinned memories. */
  private deletePinnedMemory(memoryId: number): void {
    this.pinnedService.deletePinnedMemory(this.userId, memoryId).subscribe(
      () => this.getPinnedMemories(),
      () => this.handleError('Error removing pinned memory.')
    );
  }

  /** Compares and updates pinned memories based on changes. */
  private comparePinnedMemories(pinMemories: Memory[], result: PinnedMemory[]): void {
    const pinIds = new Set(pinMemories.map(memory => memory.memory_id));
    const resultIds = new Set(result.map(item => item.id));

    const deletedIds = Array.from(pinIds).filter(id => !resultIds.has(id));
    const insertedIds = Array.from(resultIds).filter(id => !pinIds.has(id));

    deletedIds.forEach(id => this.deletePinnedMemory(id));
    insertedIds.forEach(id => this.createPinnedMemory(id));
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isUploading = true;

      this.fileUploadService.uploadProfilePicture(file, this.user.user_id).subscribe({
        next: (url) => {
          this.isUploading = false;
          this.saveProfilePictureUrl(url);
        },
        error: (error) => {
          console.error('Upload failed', error);
          this.isUploading = false;
        }
      });
    }
  }

  /** Saves the new profile picture URL in the database. */
  private saveProfilePictureUrl(url: string): void {
    this.userService.updateUserProfilePic(this.user.user_id, url).subscribe(
      () => {
        this.user.profilepic = url;
        this.showSnackBar('Profile picture updated successfully.');
      },
      () => this.handleError('Error updating profile picture.')
    );
  }

  /** Opens the password change dialog. */
  openPasswordChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, { width: '30%' });
    dialogRef.componentInstance.updateUserPassword.subscribe(() => {
      this.showSnackBar('Password changed successfully!');
    });
  }

  /** Opens the edit user dialog. */
  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '40%',
      data: { ...this.user },
    });

    dialogRef.componentInstance.updateUserData.subscribe((updatedUser: MemoriseUser) => {
      this.userService.updateUser(this.user.user_id, updatedUser).subscribe(
        () => {
          Object.assign(this.user, updatedUser);
          this.showSnackBar('Profile updated successfully.');
        },
        () => this.handleError('Error updating profile.')
      );
    });
  }

  /** Opens the pinned memories dialog. */
  openPinsDialog(): void {
    if(this.allMemories.length == undefined){
      this.showSnackBar('You must first add Memories before you can pin some!');
    }
    else{
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
  }

  /** Displays a snackbar with a custom message. */
  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, verticalPosition: 'bottom' });
  }

  /** Handles errors and displays a snackbar. */
  private handleError(message: string): void {
    console.error(message);
    this.showSnackBar(message);
  }

  getMemoriesToDisplay(): Memory[] {
    return this.pinnedService.getPinnedMemoriesWithPlacholders(this.pinnedMemories);
  }

}
