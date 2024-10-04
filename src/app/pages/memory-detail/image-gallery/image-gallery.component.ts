import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageGalleryService } from '../../../services/image-gallery.service';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrl: 'image-gallery.component.scss'
})
export class ImageGalleryComponent {
  //@Input() landscapePictures: string[] = ['../../../../assets/img/gallery_test/landscape/20230716_073010.jpg', '../../../../assets/img/gallery_test/landscape/20230716_073010.jpg', '../../../../assets/img/gallery_test/landscape/20230716_073010.jpg'];
  //@Input() portraitPictures: string[] = ['../../../../assets/img/gallery_test/portrait/20230708_155529.jpg', '../../../../assets/img/gallery_test/portrait/20230708_155529.jpg', '../../../../assets/img/gallery_test/portrait/20230708_155529.jpg'];
  landscapePictures: string[] = [];
  portraitPictures: string[] = [];
  // Define layouts for different picture combinations
  private layouts = [
    { type: 'landscape', lcount: 1, pcount: 0 },
    { type: 'portrait', lcount: 0, pcount: 2 },
    { type: 'portrait-landscape', lcount: 2, pcount: 1 }
  ];

  // Create an array to store the combined pictures with layout information
  combinedPictures: { url: string; layout: string }[] = [];
  layout: { pics: string[]; layout: string }[] = [];

  constructor(private imageDataService: ImageGalleryService) {}

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.splitImages(images); // Split into landscape and portrait
    });
    this.combinePictures();
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

  private combinePictures() {
    // Iterate over the layouts
    for (const layout of this.layouts) {
      // Calculate the number of pictures needed for the current layout
      let lpics = layout.lcount;
      let ppics = layout.pcount;

      // Check if there are enough landscape or portrait pictures
      if (layout.lcount <= this.landscapePictures.length || layout.pcount <= this.portraitPictures.length) {
        // Create a new array to store the combined pictures for the current layout
        const combinedLayoutPictures: string[] = [];

        // Add pictures to the combined layout array
        for (let i = 0; i < lpics; i++) {
          combinedLayoutPictures.push(this.landscapePictures.shift()!);
        }
        for (let i = 0; i < ppics; i++) {
          combinedLayoutPictures.push(this.portraitPictures.shift()!);
        }
        // Add the combined layout pictures to the main array
        this.layout.push({ pics: combinedLayoutPictures, layout: layout.type });
      }
    }
  }
}
