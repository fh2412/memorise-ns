import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageGalleryService } from '../../../services/image-gallery.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrl: 'image-gallery.component.scss'
})
export class ImageGalleryComponent {
  landscapePictures: string[] = [];
  portraitPictures: string[] = [];
  placeholderImage: string = '../../../../assets/img/placeholder_image.png';

  // Create an array to store the combined pictures with layout information
  combinedPictures: { url: string; layout: string }[] = [];
  layout: any[] = [];

  constructor(private imageDataService: ImageGalleryService) {}

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.splitImages(images); // Split into landscape and portrait
    });
    //this.combinePictures();
    this.layout = this.getLayoutDistribution();
    console.log(this.layout);
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
}
