import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

interface GalleryImage {
  url: string;
  userId: string;
}

@Component({
  selector: 'app-diashow',
  templateUrl: './diashow.component.html',
  styleUrls: ['./diashow.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule
  ]
})
export class DiashowComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<DiashowComponent>>(MatDialogRef);
  data = inject<{
    images: GalleryImage[];
    initialIndex: number;
  }>(MAT_DIALOG_DATA);

  currentIndex = 0;
  private intervalId?: number;
  private readonly SLIDE_INTERVAL = 5000; // 5 seconds
  isPaused = false;

  ngOnInit(): void {
    this.currentIndex = this.data.initialIndex || 0;
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    this.intervalId = window.setInterval(() => {
      this.nextImage();
    }, this.SLIDE_INTERVAL);
  }

  private stopAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.data.images.length;
  }

  previousImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.data.images.length) % this.data.images.length;
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.stopAutoplay();
    } else {
      this.startAutoplay();
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === ' ') {
      event.preventDefault();
      this.togglePause();
    } else if (event.key === 'Escape') {
      this.onCloseClick();
    }
  }
}