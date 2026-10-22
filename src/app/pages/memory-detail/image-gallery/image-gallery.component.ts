import { Component, OnInit, inject, signal } from '@angular/core';
import { ImageDialogComponent } from '@components/_dialogs/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { catchError, firstValueFrom, forkJoin, from, map, Observable, of } from 'rxjs';
import { getDownloadURL, getStorage, ref } from '@angular/fire/storage';
import { BackButtonComponent } from '@components/back-button/back-button.component';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DiashowComponent } from '@components/diashow/diashow.component';
import { ProfileAvatarComponent } from '@components/profile-avatar/profile-avatar.component';
import { MemoryService } from '@services/memory.service';
import { ImageWithMetadata } from '@models/memory-photo.model';
import { toImageWithMetadata } from '../memory-detail.helpers';

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
  imports: [BackButtonComponent, MatGridList, MatGridTile, NgOptimizedImage, LoadingSpinnerComponent, MatIcon, MatButton, ProfileAvatarComponent]
})
export class ImageGalleryComponent implements OnInit {
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private memoryService = inject(MemoryService);

  portraitPictures: GalleryImage[] = [];
  landscapePictures: GalleryImage[] = [];
  layout = signal<Layout[]>([]);
  allPictures: GalleryImage[] = [];
  userProfiles: Record<string, string> = {};
  imagesWithMetadata = signal<ImageWithMetadata[]>([]);
  memoryId: string | null = null;

  isLoading = signal<boolean>(true);

  /**
   * CHANGED: always loads the photos of the memory in the URL from the database.
   * Previously it reused ImageGalleryService data, which could belong to a different
   * memory (or be outdated after photos were deleted in manage-photos).
   */
  async ngOnInit(): Promise<void> {
    this.memoryId = this.route.snapshot.paramMap.get('id');
    if (!this.memoryId) {
      this.isLoading.set(false);
      return;
    }

    try {
      const photos = await firstValueFrom(this.memoryService.getPhotos(this.memoryId));
      const images = photos.map(toImageWithMetadata);
      this.imagesWithMetadata.set(images);
      await this.getUsers(images);
      this.splitImagesByOrientation(images);
      this.layout.set(this.generateLayoutDistribution());
    } catch (error) {
      console.error('Loading gallery photos failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async getUsers(images: ImageWithMetadata[]): Promise<void> {
    const uniqueUserIds = [...new Set(images.map(image => image.userId))].filter(id => id && id !== 'unknown');
    if (uniqueUserIds.length === 0) return;

    const profilePicObservables: Observable<UserProfile>[] = uniqueUserIds.map(userId => {
      const storage = getStorage();
      const profilePicRef = ref(storage, `profile-pictures/${userId}/thumbnail.jpg`);
      return from(getDownloadURL(profilePicRef)).pipe(
        map(url => ({ userId, profilePicUrl: url })),
        catchError(() => of({ userId, profilePicUrl: 'assets/img/1.png' })),
      );
    });

    const profiles = await firstValueFrom(forkJoin(profilePicObservables), { defaultValue: [] });
    for (const profile of profiles) {
      this.userProfiles[profile.userId] = profile.profilePicUrl;
    }
  }

  // ── Layout logic below is unchanged ──────────────────────────────────────

  private splitImagesByOrientation(images: { url: string; width: number; height: number; userId: string }[]): void {
    images.forEach((image) => {
      (image.width > image.height ? this.landscapePictures : this.portraitPictures).push({ url: image.url, userId: image.userId });
    });
  }

  private generateLayoutDistribution(): Layout[] {
    const layouts: Layout[] = [];
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
        landscapes: []
      };
    } else {
      return {
        type: 1,
        portraits: [],
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
      return { type: 3, portraits: [portrait], landscapes: [landscape, null] };
    } else if (portraitCount === 1) {
      return { type: 2, portraits: [portrait, null], landscapes: [] };
    } else {
      return { type: 1, portraits: [], landscapes: [landscape] };
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
        case 4: {
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
      data: { images: this.allPictures, initialIndex },
    });
  }

  trackByLayoutType(index: number, layout: Layout): number {
    return layout.type;
  }

  startDiashow(selectedImageUrl?: GalleryImage): void {
    this.allPictures = this.createImageArrayFromLayouts(this.layout());
    const initialIndex = selectedImageUrl ? this.allPictures.indexOf(selectedImageUrl) : 0;

    this.dialog.open(DiashowComponent, {
      data: {
        images: this.allPictures,
        initialIndex: initialIndex >= 0 ? initialIndex : 0
      },
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: '100vw',
      height: '100vh'
    });
  }
}
