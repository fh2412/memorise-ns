import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageGalleryService } from '../../../services/image-gallery.service';
import { ImageDialogComponent } from '../../../components/_dialogs/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrl: 'image-gallery.component.scss'
})
export class ImageGalleryComponent {
  landscapePictures: string[] = [];
  portraitPictures: string[] = [];
  placeholderImage: string = '../../../../assets/img/placeholder_image.png';
  allPictures: string[] = [];

  layout: any[] = [];

  constructor(private imageDataService: ImageGalleryService, private dialog: MatDialog) {}

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.splitImages(images); // Split into landscape and portrait
    });
    //this.combinePictures();
    this.layout = this.getLayoutDistribution();
  }

  splitImages(images: { url: string; width: number; height: number }[]) {
    images.forEach((image) => {
      if (image.width > image.height) {
        this.landscapePictures.push(image.url);
      } else {
        this.portraitPictures.push(image.url);
      }
    });
  }

  getLayoutDistribution() {
    let landscapeRemaining = [...this.landscapePictures]; // Clone the arrays to keep track of unused pictures
    let portraitRemaining = [...this.portraitPictures];
    let layoutBool = true;
    const layouts = [];

    // While there are pictures available or placeholders to fill the layouts
    while (landscapeRemaining.length > 0 || portraitRemaining.length > 0) {
      // Prioritize layout 3 (1 portrait, 2 landscapes)
      if (portraitRemaining.length >= 1 && landscapeRemaining.length >= 2) {
        if(layoutBool){
          layouts.push({
            type: 3,
            portrait: [portraitRemaining.shift()],
            landscapes: [landscapeRemaining.shift(), landscapeRemaining.shift()],
          });
          layoutBool=!layoutBool;
        }
        else{
          layouts.push({
            type: 4,
            portrait: [portraitRemaining.shift()],
            landscapes: [landscapeRemaining.shift(), landscapeRemaining.shift()],
          });
          layoutBool=!layoutBool;
        }
      }
      // Layout 2 (2 portraits)
      else if (portraitRemaining.length >= 2) {
        layouts.push({
          type: 2,
          portraits: [portraitRemaining.shift(), portraitRemaining.shift()],
        });
      }
      // Layout 1 (1 landscape)
      else if (landscapeRemaining.length >= 1) {
        layouts.push({
          type: 1,
          landscapes: [landscapeRemaining.shift()],
        });
      }
      // Fill with placeholders when necessary
      else if (landscapeRemaining.length === 0 || portraitRemaining.length === 0) {
        if (portraitRemaining.length >= 1 && landscapeRemaining.length === 0) {
          // Fill remaining layout with placeholders
          layouts.push({
            type: 3,
            portrait: [portraitRemaining.shift()],
            landscapes: [this.placeholderImage, this.placeholderImage],
          });
        } else if (portraitRemaining.length < 2 && landscapeRemaining.length === 0) {
          // Use a placeholder layout with two portrait placeholders
          layouts.push({
            type: 2,
            portraits: [this.placeholderImage, this.placeholderImage],
          });
        } else if (landscapeRemaining.length >= 1 && portraitRemaining.length === 0) {
          // Use landscape with placeholders
          layouts.push({
            type: 1,
            landscapes: [landscapeRemaining.shift()],
          });
        }
      }
    }

    this.shuffleArray(layouts);

    return layouts;
  }

  // Fisher-Yates (Knuth) Shuffle algorithm
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  }

  private createImageArrayFromLayouts(layouts: any[]): string[] {
    const imageArray: string[] = [];

    layouts.forEach(layout => {
      if (layout.type === 1) {
        // Layout 1: One landscape image
        imageArray.push(layout.landscapes[0]);
      } else if (layout.type === 2) {
        // Layout 2: Two portrait images
        imageArray.push(layout.portraits[0], layout.portraits[1]);
      } else if (layout.type === 3) {
        // Layout 3: One portrait and two landscape images
        imageArray.push(layout.portrait[0], layout.landscapes[0], layout.landscapes[1]);
      } else if (layout.type === 4) {
        // Layout 4: One portrait and two landscape images
        imageArray.push(layout.landscapes[0], layout.landscapes[1], layout.portrait[0]);
      }
    });

    return imageArray; // Return the ordered image array
  }

  openImageDialog(indexUrl: string) {
    this.allPictures = this.createImageArrayFromLayouts(this.layout);
    const index = this.allPictures.indexOf(indexUrl);

    const dialogRef = this.dialog.open(ImageDialogComponent, {
      data: {
        images: this.allPictures,  // Pass the array of image URLs
        initialIndex: index       // Pass the current image index
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog was closed');
    });
  }

  downloadAsZip(): void {
    const zipFileName = 'images'; // You can change this to any desired file name
    const imageUrls = this.createImageArrayFromLayouts(this.layout);
    this.imageDataService.downloadImagesAsZip(imageUrls, zipFileName);
  }
}
