// photo-download.component.ts
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmationDialogData, ConfirmDialogComponent } from '../../../components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageGalleryService } from '../../../services/image-gallery.service';
import { Memory } from '../../../models/memoryInterface.model';
import { ImageWithMetadata } from '../memory-detail.component';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { FriendsService } from '../../../services/friends.service';
import { Friend } from '../../../models/userInterface.model';


@Component({
  selector: 'app-photo-download',
  templateUrl: './photo-download.component.html',
  standalone: false,
  styleUrls: ['./photo-download.component.scss']
})
export class PhotoDownloadComponent implements OnInit {
  photos: ImageWithMetadata[] = [];
  memorydb!: Memory;
  dataSource: MatTableDataSource<ImageWithMetadata>;
  selection = new SelectionModel<ImageWithMetadata>(true, []);
  displayMode: 'grid' | 'table' = 'grid';
  displayedColumns: string[] = ['select', 'thumbnail', 'userName', 'uploadDate'];

  toppings = new FormControl('');
  userList: Friend[] = [];
  filterValue = '';
  isDownloading = false;

  constructor(public dialog: MatDialog, private imageDataService: ImageGalleryService, private friendsService: FriendsService, private router: Router) {
    this.dataSource = new MatTableDataSource<ImageWithMetadata>([]);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.memorydb = navigation.extras.state['memory'];
      console.log(this.memorydb);
    }
  }


  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.dataSource.data = images;
    });
    this.friendsService.currentFriendData.subscribe((users) => {
      this.userList = users;
    });
  }

  // Toggle display mode
  toggleDisplayMode() {
    this.displayMode = this.displayMode === 'grid' ? 'table' : 'grid';
  }

  // Check if all items are selected
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // Toggle selection of all photos
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
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