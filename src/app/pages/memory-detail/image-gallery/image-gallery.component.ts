import { Component, OnInit } from '@angular/core';
import { ImageGalleryService } from '../../../services/image-gallery.service';
import { ImageDialogComponent } from '../../../components/_dialogs/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { catchError, forkJoin, from, map, Observable, of } from 'rxjs';
import { getDownloadURL, getStorage, ref } from '@angular/fire/storage';

interface Layout {
  type: 1 | 2 | 3 | 4;
  portraits: (GalleryImage | null)[];
  landscapes: (GalleryImage | null)[];
}

interface GalleryImage {
  url: string;
  userId: string;
}

interface UserProfile {
  userId: string;
  profilePicUrl: string;
}

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  standalone: false
})

export class ImageGalleryComponent implements OnInit {
  portraitPictures: GalleryImage[] = [];
  landscapePictures: GalleryImage[] = [];
  layout: Layout[] = [];
  allPictures: GalleryImage[] = [];
  userIds: string[] = [];
  userProfiles: Record<string, string> = {};

  constructor(
    private imageDataService: ImageGalleryService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe((images) => {
      this.getUsers(images);
      this.splitImagesByOrientation(images);
      this.layout = this.generateLayoutDistribution();
    });
  }

  private async getUsers(images: { url: string; width: number; height: number; userId: string }[]): Promise<void> {
    images.forEach((image) => {
      this.userIds.push(image.userId);
    });
    const uniqueUserIds = Array.from(new Set(this.userIds)).filter(id => id !== 'unknown');

    // Fetch profile pictures for unique user IDs
    const profilePicObservables: Observable<UserProfile>[] = uniqueUserIds.map(userId => {
      const storage = getStorage();
      const profilePicRef = ref(storage, `profile-pictures/${userId}/profile.jpg`);
      return from(getDownloadURL(profilePicRef)).pipe(
        map(url => ({ userId, profilePicUrl: url })),
        catchError(error => {
          console.warn(`Profile picture not found for user ${userId}:`, error);
          return of({ userId, profilePicUrl: 'assets/default-profile.png' });
        })
      );
    });

    // Combine all profile picture fetches
    const profiles = await forkJoin(profilePicObservables).toPromise();
    if (profiles) {
      profiles.forEach(profile => {
        if (profile) {
          this.userProfiles[profile.userId] = profile.profilePicUrl;
        }
      });
    }
  }


  private splitImagesByOrientation(images: { url: string; width: number; height: number; userId: string }[]): void {
    images.forEach((image) => {
      (image.width > image.height ? this.landscapePictures : this.portraitPictures).push({ url: image.url, userId: image.userId });
    });
  }

  private generateLayoutDistribution(): Layout[] {
    const layouts: Layout[] | null = [];
    const landscapeStack = [...this.landscapePictures];
    const portraitStack = [...this.portraitPictures];
    let alternateLayout = true;

    while (landscapeStack.length > 0 || portraitStack.length > 0) {
      if (portraitStack.length >= 1 && landscapeStack.length >= 2) {
        layouts.push(this.createLayout(alternateLayout ? 3 : 4, portraitStack, landscapeStack));
        alternateLayout = !alternateLayout;
      } else if (portraitStack.length >= 2) {
        layouts.push(this.createLayout(2, portraitStack, landscapeStack));
      } else if (landscapeStack.length >= 1) {
        layouts.push(this.createLayout(1, portraitStack, landscapeStack));
      } else {
        layouts.push(this.createPlaceholderLayout(portraitStack, landscapeStack));
        break;
      }
    }
    this.shuffleArray(layouts);
    return layouts;
  }

  private createLayout(type: number, portraitStack: GalleryImage[], landscapeStack: GalleryImage[]): Layout {
    if (type === 3 || type === 4) {
      return {
        type,
        portraits: portraitStack.length > 0 ? [portraitStack.shift()!] : [null],
        landscapes: landscapeStack.length > 1 ?
          [landscapeStack.shift()!, landscapeStack.shift()!] :
          landscapeStack.length === 1 ?
            [landscapeStack.shift()!, null] :
            [null, null]
      };
    } else if (type === 2) {
      return {
        type,
        portraits: portraitStack.length > 1 ?
          [portraitStack.shift()!, portraitStack.shift()!] :
          portraitStack.length === 1 ?
            [portraitStack.shift()!, null] :
            [null, null],
        landscapes: [] // Always provide landscapes array, even if empty
      };
    } else {
      return {
        type: 1,
        portraits: [], // Always provide portraits array, even if empty
        landscapes: landscapeStack.length > 0 ? [landscapeStack.shift()!] : [null]
      };
    }
  }

  private createPlaceholderLayout(portraitStack: GalleryImage[], landscapeStack: GalleryImage[]): Layout {
    const portraitCount = portraitStack.length;
    const landscapeCount = landscapeStack.length;
    const portrait = portraitStack.length > 0 ? portraitStack.shift()! : null;
    const landscape = landscapeStack.length > 0 ? landscapeStack.shift()! : null;

    if (portraitCount === 1 && landscapeCount === 1) {
      return {
        type: 3,
        portraits: [portrait],
        landscapes: [landscape, null],
      };
    } else if (portraitCount === 1) {
      return {
        type: 2,
        portraits: [portrait, null],
        landscapes: [], // Always provide landscapes array
      };
    } else {
      return {
        type: 1,
        portraits: [], // Always provide portraits array
        landscapes: [landscape],
      };
    }
  }

  private shuffleArray(array: Layout[]): void {
    for (let i = array.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private createImageArrayFromLayouts(layouts: Layout[]): GalleryImage[] {
    return layouts.flatMap((layout) => {
      switch (layout.type) {
        case 1:
          return layout.landscapes.filter(img => img !== null);
        case 2:
          return layout.portraits.filter(img => img !== null);
        case 3:
        case 4:
          {
            const portraits = layout.portraits.filter(img => img !== null);
            const landscapes = layout.landscapes.filter(img => img !== null);
            return [...portraits, ...landscapes];
          }
        default:
          return [];
      }
    });
  }

  openImageDialog(selectedImageUrl: GalleryImage): void {
    // Only open dialog if the image is not null/empty
    if (!selectedImageUrl) return;

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