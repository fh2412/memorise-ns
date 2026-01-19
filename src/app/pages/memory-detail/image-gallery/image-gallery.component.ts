import { Component, OnInit, inject, signal } from '@angular/core';
import { ImageGalleryService } from '@services/image-gallery.service';
import { ImageDialogComponent } from '@components/_dialogs/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { catchError, firstValueFrom, forkJoin, from, map, Observable, of } from 'rxjs';
import { getDownloadURL, getMetadata, getStorage, listAll, ref } from '@angular/fire/storage';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { PersonHintComponent } from '../../../components/person-hint/person-hint.component';
import { NgOptimizedImage } from '@angular/common';
import { ImageWithMetadata } from '../memory-detail.component';
import { ActivatedRoute } from '@angular/router';
import { MemoryService } from '@services/memory.service';
import { LoadingSpinnerComponent } from "@components/loading-spinner/loading-spinner.component";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from '@angular/material/button';

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
  imports: [BackButtonComponent, MatGridList, MatGridTile, PersonHintComponent, NgOptimizedImage, LoadingSpinnerComponent, MatIcon, MatButton]
})

export class ImageGalleryComponent implements OnInit {
  private imageDataService = inject(ImageGalleryService);
  private memoryService = inject(MemoryService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  portraitPictures: GalleryImage[] = [];
  landscapePictures: GalleryImage[] = [];
  layout = signal<Layout[]>([]);
  allPictures: GalleryImage[] = [];
  userIds: string[] = [];
  userProfiles: Record<string, string> = {};
  imagesWithMetadata = signal<ImageWithMetadata[]>([])
  memoryId: string | null = null;

  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.imageDataService.currentImageData.subscribe(async (images) => {

      if (this.imagesWithMetadata().length > 0) {
        this.isLoading.set(false);
        return;
      }

      if (images.length === 0) {
        this.memoryId = this.route.snapshot.paramMap.get('id');
        if (this.memoryId) {
          const imagePath = await this.getMemoriesImagePath(this.memoryId)
          await this.getImages(imagePath);
        }
      }
      else {
        this.imagesWithMetadata.set(images)
        await this.getUsers(this.imagesWithMetadata());
        this.splitImagesByOrientation(this.imagesWithMetadata());
        this.layout.set(this.generateLayoutDistribution());
        this.isLoading.set(false);
      }
    });
  }

  private async getMemoriesImagePath(memoryId: string): Promise<string> {
    const memory = await firstValueFrom(this.memoryService.getMemory(Number(memoryId)))
    return memory.image_url;
  }

  private getImages(imageId: string): void {
    const storage = getStorage();
    const listRef = ref(storage, `memories/${imageId}`);
    listAll(listRef).then((res) => {
      const fetchPromises = res.items.map((itemRef) => {

        const fullRef = ref(storage, itemRef.fullPath);
        return getDownloadURL(fullRef).then((url) =>
          getMetadata(fullRef).then((metadata) => ({
            url,
            width: parseInt(metadata.customMetadata?.['width'] || '0', 10),
            height: parseInt(metadata.customMetadata?.['height'] || '0', 10),
            created: metadata.timeCreated,
            size: metadata.size,
            userId: metadata.customMetadata?.['userId'] || '',
          }))
        );
      });

      Promise.all(fetchPromises).then((images) => {
        this.imagesWithMetadata.set(images);
        this.getUsers(this.imagesWithMetadata());
        this.splitImagesByOrientation(this.imagesWithMetadata());
        this.layout.set(this.generateLayoutDistribution());
        this.isLoading.set(false);
      });
    }).catch((error) => {
      console.error('Error listing items:', error);
    });
  }

  private async getUsers(images: { url: string; width: number; height: number; userId: string }[]): Promise<void> {
    images.forEach((image) => {
      this.userIds.push(image.userId);
    });
    const uniqueUserIds = Array.from(new Set(this.userIds)).filter(id => id !== 'unknown');

    const profilePicObservables: Observable<UserProfile>[] = uniqueUserIds.map(userId => {
      const storage = getStorage();
      const profilePicRef = ref(storage, `profile-pictures/${userId}/thumbnail.jpg`);
      return from(getDownloadURL(profilePicRef)).pipe(
        map(url => ({ userId, profilePicUrl: url })),
        catchError(error => {
          console.warn(`Profile picture not found for user ${userId}:`, error);
          return of({ userId, profilePicUrl: 'assets/img/1.png' });
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
    if (!selectedImageUrl) return;

    this.allPictures = this.createImageArrayFromLayouts(this.layout());
    const initialIndex = this.allPictures.indexOf(selectedImageUrl);

    this.dialog.open(ImageDialogComponent, {
      data: {
        images: this.allPictures,
        initialIndex,
      }
    });
  }

  trackByLayoutType(index: number, layout: Layout): number {
    return layout.type;
  }

  startDiashow() {
    throw new Error('Method not implemented.');
  }
}