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


@Component({
  selector: 'app-photo-download',
  templateUrl: './photo-download.component.html',
  standalone: false,
  styleUrls: ['./photo-download.component.scss']
})
export class PhotoDownloadComponent implements OnInit {
  // Input for photos from parent component
  photos: ImageWithMetadata[] = [];
  memorydb!: Memory;

  // Data source for table view
  dataSource: MatTableDataSource<ImageWithMetadata>;

  // Selection model for checkbox selection
  selection = new SelectionModel<ImageWithMetadata>(true, []);

  // Display modes
  displayMode: 'grid' | 'table' = 'grid';

  // Columns for table view
  displayedColumns: string[] = ['select', 'thumbnail', 'userName', 'uploadDate'];

  // Filter predicate
  filterValue = '';
  isDownloading = false;

  constructor(public dialog: MatDialog, private imageDataService: ImageGalleryService, private router: Router) {
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