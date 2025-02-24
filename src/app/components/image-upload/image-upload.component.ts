import { Component, Input, OnInit } from '@angular/core';
import { UploadProgressDialogComponent } from '../_dialogs/upload-progress-dialog/upload-progress-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../../services/userService';
import { MemoryFormData } from '../../models/memoryInterface.model';

export interface ImageFileWithDimensions {
  file: File;
  width: number;
  height: number;
}

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
    standalone: false
})

export class ImageUploadComponent implements OnInit {
  @Input() userId = '';
  @Input() memoryId = '';
  @Input() memoryData: MemoryFormData | null = null;
  @Input() friends_emails: string[] = [];
  @Input() picture_count = 0;
  @Input() googleStorageUrl = "";


  selectedFiles: File[] = [];

  previews: string[] = [];
  downloadURL: string | undefined;
  imageFileWithDimensions: ImageFileWithDimensions[] = [];

  starredIndex: number | null = 0;
  hoverIndex: number | null = null;

  constructor(private dialog: MatDialog, private router: Router, private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    if (this.picture_count == 0) {
      this.googleStorageUrl = this.userId.toString() + Date.now().toString();
    }
    if (this.userId == undefined) {
      await this.userService.userId$.subscribe((userId) => {
        if (userId) {
          this.userId = userId;
        }
      });
    }
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newFiles = input.files;

    // Combine existing files with new ones (if applicable)
    this.selectedFiles = newFiles ? [...this.selectedFiles, ...Array.from(newFiles)] : this.selectedFiles;
    this.imageFileWithDimensions = []; // Clear previous selections
    this.previews = [];

    if (newFiles) {
      Array.from(newFiles).forEach((file: File) => {
        const reader = new FileReader();

        // Read image data and handle dimensions
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const preview = e.target?.result as string;

          // Get image dimensions using FileReader and Image object
          const img = new Image();
          img.onload = () => {
            const fileWithDimensions: ImageFileWithDimensions = {
              file: file,
              width: img.naturalWidth,
              height: img.naturalHeight,
            };
            this.imageFileWithDimensions.push(fileWithDimensions);
            this.previews.push(preview);
          };
          img.src = preview;
        };

        reader.onerror = (error: ProgressEvent<FileReader>) => {
          console.error('Error reading file:', error);
          // Handle errors gracefully, e.g., display an error message
        };

        reader.readAsDataURL(file); // Read as data URL for preview
      });
    }
  }

  uploadFiles(): void {
    if (this.selectedFiles) {
      const dialogRef = this.dialog.open(UploadProgressDialogComponent, {
        width: '300px',
        disableClose: true, // Prevent closing the dialog by clicking outside
        data: { userId: this.userId, memoryId: this.memoryId, filesWithDimensions: this.imageFileWithDimensions, memoryData: this.memoryData, friends_emails: this.friends_emails, picture_count: this.picture_count, googleStorageUrl: this.googleStorageUrl, starredIndex: this.starredIndex },
      });

      // Subscribe to the dialog's afterClosed event to handle actions after the dialog is closed
      dialogRef.afterClosed().subscribe(() => {
        this.router.navigate(['/home']);
      });
    }
  }

  removeImage(index: number): void {
    this.previews.splice(index, 1);
    this.imageFileWithDimensions.splice(index, 1);
    if (this.previews.length === 0) {
      this.selectedFiles = [];
    }
  }

  onStar(index: number) {
    if (this.starredIndex === index) {
      this.starredIndex = null;  // Unstar the currently starred image
    } else {
      this.starredIndex = index;  // Star the new image
    }
  }
}



