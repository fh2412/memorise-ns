import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent implements OnInit {

  imageLayouts: any[] = [];

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {imageUrls: string[]}) { }

  async ngOnInit() {
    this.arrangeImages();
  }

  async arrangeImages() {
    const portraitImages: string[] = [];
    const landscapeImages: string[] = [];
  
    // Map each URL to a promise that resolves with the image dimensions and categorizes the image
    const dimensionPromises = this.data.imageUrls.map(async (url) => {
      const dimensions = await this.getImageDimensions(url);
      if (dimensions.height > dimensions.width) {
        portraitImages.push(url);
      } else {
        landscapeImages.push(url);
      }
    });
  
    // Wait for all promises to resolve
    await Promise.all(dimensionPromises);
  
    this.generateLayouts(landscapeImages, portraitImages);
  }

  generateLayouts(landscape: any[], portrait: string[]) {
    let landscapeIndex = 0;
    let portraitIndex = 0;

    while (landscapeIndex < landscape.length || portraitIndex < portrait.length) {
      const layoutType = this.imageLayouts.length % 4 + 1;

      if (layoutType === 1 && landscapeIndex < landscape.length) {
        this.imageLayouts.push({ type: 1, images: [landscape[landscapeIndex++]] });
        landscapeIndex++;
      } else if (layoutType === 2 && portraitIndex + 1 < portrait.length) {
        this.imageLayouts.push({ type: 2, images: [portrait[portraitIndex++], portrait[portraitIndex++]] });
        portraitIndex = portraitIndex + 2;
      } else if (layoutType === 3 && landscapeIndex + 1 < landscape.length && portraitIndex < portrait.length) {
        this.imageLayouts.push({ type: 3, images: [portrait[portraitIndex++], landscape[landscapeIndex++], landscape[landscapeIndex++]] });
        portraitIndex++;
        landscapeIndex = landscapeIndex + 2;
      } else if (layoutType === 4 && landscapeIndex + 1 < landscape.length && portraitIndex < portrait.length) {
        this.imageLayouts.push({ type: 4, images: [portrait[portraitIndex++], landscape[landscapeIndex++], landscape[landscapeIndex++]] });
        portraitIndex++;
        landscapeIndex = landscapeIndex + 2;
      }
    }
  }

  getImageDimensions(url: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = url;
    });
  }
}
