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
  @Input() userId: any;
  @Input() memoryData: any;
  @Input() friends: any;
  @Input() emails: any;


  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];

  previews: string[] = [];
  imageInfos?: Observable<any>;
  downloadURL: string | undefined;

  constructor(private uploadService: FileUploadService, private dialog: MatDialog, private memoryService: MemoryService, private router: Router) { }


  selectFiles(event: any): void {
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;

    this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.previews.push(e.target.result);
        };

        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }

  uploadFiles(): void {
    this.message = [];

    if (this.selectedFiles) {
      this.openUploadDialog();
    }
  }

  ngOnInit(): void {
    this.imageInfos = this.uploadService.getFiles();
  }

  openUploadDialog() {
    const filesArray: File[] = Array.from(this.selectedFiles || []);
    const dialogRef = this.dialog.open(UploadProgressDialogComponent, {
      width: '300px',
      disableClose: true, // Prevent closing the dialog by clicking outside
      data: { userId: this.userId, files: filesArray, memoryData: this.memoryData, emails: this.emails },
    });

    // Subscribe to the dialog's afterClosed event to handle actions after the dialog is closed
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed with result:', result);
      this.router.navigate(['/home']);
    });
  }
}



