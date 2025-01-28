import { Component, OnInit } from '@angular/core';
import { ImageGalleryService } from '../../../services/image-gallery.service';
import { ImageDialogComponent } from '../../../components/_dialogs/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface Layout {
  type: 1 | 2 | 3 | 4; 
  portraits?: string[]; // Optional, appears in type 2 or 3
  landscapes?: string[]; // Optional, appears in all types
}


@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})

export class ImageGalleryComponent implements OnInit {
  landscapePictures: string[] = [];
  portraitPictures: string[] = [];
  placeholderImage = '../../../../assets/img/placeholder_image.png';
  layout: Layout[] = [];
  allPictures: string[] = [];

  constructor(
    private imageDataService: ImageGalleryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.splitImagesByOrientation(images);
      this.layout = this.generateLayoutDistribution();
    });
  }

  private splitImagesByOrientation(images: { url: string; width: number; height: number }[]): void {
    images.forEach((image) => {
      (image.width > image.height ? this.landscapePictures : this.portraitPictures).push(image.url);
    });
  }

  private generateLayoutDistribution(): Layout[] {
    const layouts = [];
    const landscapeStack = [...this.landscapePictures];
    const portraitStack = [...this.portraitPictures];
    let alternateLayout = true;

    while (landscapeStack.length > 0 || portraitStack.length > 0) {
      if (portraitStack.length >= 1 && landscapeStack.length >= 2) {
        layouts.push(this.createLayout(alternateLayout ? 3 : 4, portraitStack, landscapeStack));
        alternateLayout = !alternateLayout;
      } else if (portraitStack.length >= 2) {
        layouts.push(this.createLayout(2, portraitStack, ["place", "holder"]));
      } else if (landscapeStack.length >= 1) {
        layouts.push(this.createLayout(1, ["place", "holder"], landscapeStack));
      } else {
        layouts.push(this.createPlaceholderLayout(portraitStack, landscapeStack));
        break;
      }
    }
    this.shuffleArray(layouts);
    return layouts;
  }

  private createLayout(type: number, portraitStack: string[], landscapeStack: string[]): Layout {
    if (type === 3 || type === 4) {
      return {
        type,
        portraits: portraitStack.length > 0 ? [portraitStack.shift()!] : [this.placeholderImage],
        landscapes: landscapeStack.length > 1 ? [landscapeStack.shift()!, landscapeStack.shift()!] : [this.placeholderImage, this.placeholderImage]
      };
    } else if (type === 2) {
      return {
        type,
        portraits: portraitStack.length > 1 ? [portraitStack.shift()!, portraitStack.shift()!] : [this.placeholderImage, this.placeholderImage]
      };
    } else {
      return {
        type: 1,
        landscapes: landscapeStack.length > 0 ? [landscapeStack.shift()!] : [this.placeholderImage]
      };
    }
  }
  

  private createPlaceholderLayout(portraitStack: string[], landscapeStack: string[]): Layout {
    const portraitCount = portraitStack.length;
    const landscapeCount = landscapeStack.length;
    const portrait = portraitStack.length > 0 ? portraitStack.shift() : this.placeholderImage;
    const landscape = landscapeStack.length > 0 ? landscapeStack.shift() : this.placeholderImage;
    
    if (portraitCount === 1 && landscapeCount === 1) {
      return {
        type: 3,
        portraits: [portrait!],
        landscapes: [landscape!, this.placeholderImage],
      };
    } else if (portraitCount === 1) {
      return {
        type: 2,
        portraits: [portrait!, this.placeholderImage],
      };
    } else {
      return {
        type: 1,
        landscapes: [landscape!],
      };
    }
  }
  
  private shuffleArray(array: Layout[]): void {
    for (let i = array.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private createImageArrayFromLayouts(layouts: Layout[]): string[] {
    return layouts.flatMap((layout) => {
      switch (layout.type) {
        case 1:
          return layout.landscapes!;
        case 2:
          return layout.portraits!;
        case 3:
        case 4:
          return [...layout.portraits!, ...layout.landscapes!];
        default:
          return [];
      }
    });
  }

  openImageDialog(selectedImageUrl: string): void {
    this.allPictures = this.createImageArrayFromLayouts(this.layout);
    const initialIndex = this.allPictures.indexOf(selectedImageUrl);

    const dialogRef = this.dialog.open(ImageDialogComponent, {
      data: {
        images: this.allPictures,
        initialIndex
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog was closed');
    });
  }

  trackByLayoutType(index: number, layout: Layout): number {
    return layout.type;
  }
  
}
