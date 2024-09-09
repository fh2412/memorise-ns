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

  ngOnInit(): void {
    this.arrangeImages();
  }

  arrangeImages() {
    const portraitImages: string[] = [];
    const landscapeImages: string[] = [];

    this.data.imageUrls.forEach((url) => {
      this.getImageDimensions(url).then(dimensions => {
        if (dimensions.height > dimensions.width) {
          portraitImages.push(url);
        } else {
          landscapeImages.push(url);
        }
      });
    });

    console.log("port: ", portraitImages);
    console.log("land: ", landscapeImages);
    
    // Layout 1: One landscape image per row
    landscapeImages.forEach(landscapeUrl => {
      this.imageLayouts.push({ type: 'landscape', urls: [landscapeUrl] });
    });

    // Layout 2: Two portrait images side by side
    for (let i = 0; i < portraitImages.length; i += 2) {
      this.imageLayouts.push({
        type: 'two-portraits',
        urls: [portraitImages[i], portraitImages[i + 1]]
      });
    }

    // Layout 3: One portrait with two landscape images underneath
    while (portraitImages.length && landscapeImages.length >= 2) {
      this.imageLayouts.push({
        type: 'portrait-two-landscapes',
        urls: [
          portraitImages.shift(),
          landscapeImages.shift(),
          landscapeImages.shift()
        ]
      });
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
