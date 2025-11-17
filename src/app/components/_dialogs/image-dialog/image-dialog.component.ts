import { Component, OnInit, HostListener, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

interface GalleryImage {
  url: string;
  userId: string;
}

@Component({
    selector: 'app-image-dialog',
    templateUrl: './image-dialog.component.html',
    styleUrls: ['./image-dialog.component.scss'],
    imports: [
      MatIconModule,
      MatButtonModule
    ]
})
export class ImageDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ImageDialogComponent>>(MatDialogRef);
  data = inject<{
    images: GalleryImage[];
    initialIndex: number;
}>(MAT_DIALOG_DATA);

  currentIndex = 0;

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
