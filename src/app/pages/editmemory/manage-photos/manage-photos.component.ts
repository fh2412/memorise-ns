import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getDownloadURL, getMetadata, getStorage, listAll, ref } from '@angular/fire/storage';
import { FileUploadService } from '../../../services/file-upload.service';
import { MemoryService } from '../../../services/memory.service';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-manage-photos',
    templateUrl: './manage-photos.component.html',
    styleUrl: './manage-photos.component.scss',
    standalone: false
})
export class ManagePhotosComponent implements OnInit {
  imagesToDelete: string[] = [];
  imageUrl: string | null = null;

  images: { url: string; isStarred: boolean }[] = []; // Array of image objects with URL and star status
  starredIndex: number | null = null;  // Index of the currently starred image
  hoverIndex: number | null = null;    // Index of the currently hovered image

  constructor(
    private route: ActivatedRoute,
    private fileService: FileUploadService,
    private location: Location,
    private memoryService: MemoryService,
    private snackBar: MatSnackBar,

  ) {}

  ngOnInit(): void {
    // Retrieve imageUrl from route params
    this.route.paramMap.subscribe(params => {
      this.imageUrl = params.get('imageUrl');
      this.getImages(this.imageUrl);
    });
  }

  /**
   * Fetch images and metadata from Firebase and set up starred image.
   * @param imageId The ID of the image folder in Firebase storage.
   */
  async getImages(imageId: string | null) {
    if (!imageId) return;
    const storage = getStorage();
    const listRef = ref(storage, `memories/${imageId}`);
    
    try {
      const res = await listAll(listRef);
      for (const itemRef of res.items) {
        const imageRef = ref(storage, itemRef.fullPath);

        try {
          const [url, metadata] = await Promise.all([
            getDownloadURL(imageRef),
            getMetadata(imageRef)
          ]);

          const isStarred = metadata.customMetadata?.['isStarred'] === 'true';
          this.images.push({ url, isStarred });

          if (isStarred) {
            this.starredIndex = this.images.length - 1;
          }
        } catch (error) {
          console.error("Error fetching URL or metadata:", error);
        }
      }
    } catch (error) {
      console.error("Error listing images:", error);
    }
  }

  /**
   * Set the specified image as starred and update on Firebase.
   * @param index The index of the image to star.
   */
  onStar(index: number) {
    if (this.starredIndex !== null) {
      this.snackBar.open('Title Picutre changed!', 'Nice', { duration: 3000 });
      this.fileService.starImage(index, this.starredIndex, this.images[this.starredIndex].url, this.images[index].url);
      this.memoryService.updateTitlePic(this.imageUrl, this.images[index].url).subscribe();
      this.starredIndex = index;
    }
  }

  /**
   * Mark image for deletion and remove from display list.
   * @param imageUrl The URL of the image to delete.
   */
  onDelete(imageUrl: string) {
    const imageToDelete = this.images.find(item => item.url === imageUrl);
    
    if (imageToDelete) {
      this.imagesToDelete.push(imageToDelete.url);
      this.images = this.images.filter(item => item.url !== imageUrl);

      if (this.starredIndex !== null && this.images[this.starredIndex]?.url === imageUrl) {
        this.starredIndex = null;
      }
    }
  }

  /**
   * Remove image from delete list and restore it in display list.
   * @param imageUrl The URL of the image to restore.
   */
  removeFromDeleteList(imageUrl: string) {
    const imageToRestore = this.imagesToDelete.find(item => item === imageUrl);
  
    if (imageToRestore) {
      const restoredImage = { url: imageUrl, isStarred: false };
      this.images.push(restoredImage);
      this.imagesToDelete = this.imagesToDelete.filter(item => item !== imageUrl);
    }
  }

  /**
   * Delete all marked images permanently.
   */
  deleteImages() {
    this.fileService.deleteImages(this.imagesToDelete);
    this.imagesToDelete = [];
  }

  /**
   * Navigate to the home page.
   */
  goToHome(): void {
    this.location.back();
  }
}
