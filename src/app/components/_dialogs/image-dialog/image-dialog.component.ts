import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.css']
})
export class ImageDialogComponent implements OnInit {
  currentIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { images: string[], initialIndex: number }
  ) {}

  ngOnInit(): void {
    this.currentIndex = this.data.initialIndex;
  }

  onArrowClick(direction: 'left' | 'right'): void {
    if (direction === 'left') {
      this.currentIndex = (this.currentIndex - 1 + this.data.images.length) % this.data.images.length;
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.data.images.length;
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
