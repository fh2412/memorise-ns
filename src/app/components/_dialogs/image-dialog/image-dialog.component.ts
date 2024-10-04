import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.onArrowClick('left');
    } else if (event.key === 'ArrowRight') {
      this.onArrowClick('right');
    } else if (event.key === 'Escape') {
      this.onCloseClick();
    }
  }
}
