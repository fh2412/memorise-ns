// photo-download.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmationDialogData, ConfirmDialogComponent } from '@components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageGalleryService } from '@services/image-gallery.service';
import { Memory } from '@models/memoryInterface.model';
import { ImageWithMetadata } from '../memory-detail.component';
import { Router } from '@angular/router';
import { FriendsService } from '@services/friends.service';
import { MemoryDetailFriend } from '@models/userInterface.model';
import { MemoriseUser } from '@models/userInterface.model';
import { forkJoin } from 'rxjs';
import { UserService } from '@services/userService';

// Extended interface to include user data
export interface ImageWithUserData extends ImageWithMetadata {
  user?: MemoriseUser;
}

@Component({
  selector: 'app-photo-download',
  templateUrl: './photo-download.component.html',
  standalone: false,
  styleUrls: ['./photo-download.component.scss']
})
export class PhotoDownloadComponent implements OnInit {
  dialog = inject(MatDialog);
  private imageDataService = inject(ImageGalleryService);
  private friendsService = inject(FriendsService);
  private router = inject(Router);
  private userService = inject(UserService);

  photos: ImageWithUserData[] = [];
  memorydb!: Memory;
  dataSource: MatTableDataSource<ImageWithUserData>;
  selection = new SelectionModel<ImageWithUserData>(true, []);
  displayMode: 'grid' | 'table' = 'grid';
  displayedColumns: string[] = ['select', 'thumbnail', 'userName', 'size', 'uploadDate'];
  selectedUsers: MemoriseUser[] = [];
  userList: MemoryDetailFriend[] = [];
  availableUsers: MemoriseUser[] = [];
  filterValue = '';
  isDownloading = false;
  isLoadingUsers = false;

  constructor() {
    this.dataSource = new MatTableDataSource<ImageWithUserData>([]);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.memorydb = navigation.extras.state['memory'];
    }
  }

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.loadUsersForImages(images);
    });

    this.friendsService.currentFriendData.subscribe((users) => {
      this.userList = users;
    });
  }

  // Load user data for all images
  loadUsersForImages(images: ImageWithMetadata[]) {
    this.isLoadingUsers = true;
    
    // Get unique user IDs
    const uniqueUserIds = [...new Set(images.map(img => img.userId))];
    
    // Create observables for each user
    const userRequests = uniqueUserIds.map(userId => 
      this.userService.getUser(userId)
    );

    // Execute all requests
    forkJoin(userRequests).subscribe({
      next: (users: MemoriseUser[]) => {
        // Create a map for quick user lookup
        const userMap = new Map<string, MemoriseUser>();
        users.forEach(user => userMap.set(user.user_id, user));

        // Attach user data to images
        const imagesWithUsers: ImageWithUserData[] = images.map(img => ({
          ...img,
          user: userMap.get(img.userId)
        }));

        this.dataSource.data = imagesWithUsers;
        this.availableUsers = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoadingUsers = false;
        // Fallback: use images without user data
        this.dataSource.data = images.map(img => ({ ...img }));
      }
    });
  }

  // Handle user selection change
  onUserSelectionChange() {
    this.applyFilter();
  }

  // Apply user filter
  applyFilter() {
    const selectedUserIds = this.selectedUsers?.map(user => user.user_id) || [];
    
    if (selectedUserIds.length === 0) {
      // Show all images if no filter selected
      this.dataSource.filter = '';
    } else {
      // Filter by selected users
      this.dataSource.filterPredicate = (data: ImageWithUserData) => {
        return selectedUserIds.includes(data.userId);
      };
      this.dataSource.filter = 'userFilter'; // Trigger filter
    }
  }

  // Clear all filters
  clearFilters() {
    this.selectedUsers = [];
    this.dataSource.filter = '';
  }

  // Toggle display mode
  toggleDisplayMode() {
    this.displayMode = this.displayMode === 'grid' ? 'table' : 'grid';
  }

  // Check if all items are selected
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length; // Use filteredData instead of data
    return numSelected === numRows;
  }

  // Toggle selection of all photos
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.filteredData); // Use filteredData instead of data
  }

  // Handle download all photos
  downloadAllPhotos() {
    const confirmationData: ConfirmationDialogData = {
      title: 'Download memories images?',
      message: 'With clicking "YES" you start the download of this memories images',
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '450px', data: confirmationData });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.imageDataService.downloadZip(this.memorydb.image_url, this.memorydb.title).subscribe();
      }
    });
  }

  // Handle download selected photos
  downloadSelectedPhotos() {
    const confirmationData: ConfirmationDialogData = {
      title: 'Download memories images?',
      message: 'With clicking "YES" you start the download of this memories images',
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '450px', data: confirmationData });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isDownloading = true;
        console.log("Selceted images: ", this.selection.selected);
        this.imageDataService.downloadSelectedZip(this.selection.selected, this.memorydb.title)
          .subscribe(() => {
            this.isDownloading = false;
          }, () => {
            this.isDownloading = false;
          });
      }
    });
  }
}