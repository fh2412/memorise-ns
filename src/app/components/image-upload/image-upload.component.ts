import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploadService } from '../../services/file-upload.service';
import { UploadProgressDialogComponent } from '../_dialogs/upload-progress-dialog/upload-progress-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '../../services/memory.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() userId: any = '';
  @Input() memoryId: string = '';
  @Input() memoryData: any;
  @Input() friends: any;
  @Input() emails: any;
  @Input() picture_count: number = 0;
  @Input() googleStorageUrl: String = "";


  selectedFiles: any[] = [];
  progressInfos: any[] = [];

  previews: string[] = [];
  imageInfos?: Observable<any>;
  downloadURL: string | undefined;

  constructor(private uploadService: FileUploadService, private dialog: MatDialog, private memoryService: MemoryService, private router: Router) { }


  selectFiles(event: any): void {
    this.progressInfos = [];
    const newFiles = event.target.files;
    this.selectedFiles = this.selectedFiles || [];
    Array.prototype.push.apply(this.selectedFiles, newFiles);

    this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };

        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }

  uploadFiles(): void {
    if (this.selectedFiles) {
      this.openUploadDialog();
    }
  }

  ngOnInit(): void {
    this.imageInfos = this.uploadService.getFiles();
    if(this.picture_count == 0){
      this.googleStorageUrl = this.userId.toString() + Date.now().toString();
      console.log("New Memory");
    }
  }

  openUploadDialog() {
    const filesArray: File[] = Array.from(this.selectedFiles || []);
    const dialogRef = this.dialog.open(UploadProgressDialogComponent, {
      width: '300px',
      disableClose: true, // Prevent closing the dialog by clicking outside
      data: { userId: this.userId, memoryId: this.memoryId, files: filesArray, memoryData: this.memoryData, picture_count: this.picture_count, googleStorageUrl: this.googleStorageUrl },
    });

    // Subscribe to the dialog's afterClosed event to handle actions after the dialog is closed
    dialogRef.afterClosed().subscribe((result) => {
      this.router.navigate(['/home']);
    });
  }

  removeImage(index: number): void {
    this.previews.splice(index, 1);
    if(this.previews.length === 0){
      this.selectedFiles = [];
    }
  }
}



