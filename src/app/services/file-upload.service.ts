import { inject, Injectable } from '@angular/core';
import { Observable, finalize, forkJoin, from, of, switchMap } from 'rxjs';
import { deleteObject, getMetadata, Storage, ref, updateMetadata, uploadBytesResumable, listAll, getDownloadURL, StorageReference } from '@angular/fire/storage';
import { ImageFileWithDimensions } from '../components/image-upload/image-upload.component';
import { BillingService, DeletionData } from './billing.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private storage = inject(Storage);
  private billingService = inject(BillingService);


  uploadProfilePicture(file: File, userId: string): Observable<string> {
    return new Observable((observer) => {
      const filePath = `profile-pictures/${userId}/profile.jpg`;
      const thumbnailPath = `profile-pictures/${userId}/thumbnail.jpg`;

      const storageRef = ref(this.storage, filePath);
      const thumbnailRef = ref(this.storage, thumbnailPath);

      // Create thumbnail
      this.createThumbnail(file, 128).then((thumbnailFile) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        const thumbnailUploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);

        let mainUploadComplete = false;
        let thumbnailUploadComplete = false;
        let downloadURL = '';

        const checkCompletion = () => {
          if (mainUploadComplete && thumbnailUploadComplete) {
            observer.next(downloadURL);
            observer.complete();
          }
        };

        // Main image upload
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            console.log('Main upload:', snapshot.state);
          },
          (error) => {
            console.log("ERROR IN SERVICE (main): ", error);
            observer.error(error);
          },
          async () => {
            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            mainUploadComplete = true;
            checkCompletion();
          }
        );

        // Thumbnail upload
        thumbnailUploadTask.on(
          'state_changed',
          (snapshot) => {
            console.log('Thumbnail upload:', snapshot.state);
          },
          (error) => {
            console.log("ERROR IN SERVICE (thumbnail): ", error);
            observer.error(error);
          },
          async () => {
            console.log('Thumbnail upload completed');
            thumbnailUploadComplete = true;
            checkCompletion();
          }
        );

      }).catch((error) => {
        console.log("ERROR creating thumbnail: ", error);
        observer.error(error);
      });
    });
  }

  private createThumbnail(file: File, minSize: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Calculate new dimensions maintaining aspect ratio
        // At least one dimension should be minSize (64px)
        let newWidth: number;
        let newHeight: number;

        if (originalWidth < originalHeight) {
          // Portrait: make width = minSize, scale height proportionally
          newWidth = minSize;
          newHeight = Math.round((originalHeight * minSize) / originalWidth);
        } else {
          // Landscape or square: make height = minSize, scale width proportionally
          newHeight = minSize;
          newWidth = Math.round((originalWidth * minSize) / originalHeight);
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw image scaled to new dimensions
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], 'thumbnail.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(thumbnailFile);
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  uploadMemoryPicture(memoryId: string, file: ImageFileWithDimensions, count: number, index: number, isStarred: boolean, userId: string): Observable<number | undefined> {
    const path = `memories/${memoryId}/picture_${index + count + 1}.jpg`;
    const storageRef = ref(this.storage, path);

    // Define metadata with custom dimensions
    const metadata = {
      customMetadata: {
        width: file.width.toString(),
        height: file.height.toString(),
        isStarred: isStarred.toString(),
        userId: userId
      }
    };

    // Upload the file with metadata
    const uploadTask = uploadBytesResumable(storageRef, file.file, metadata);

    return new Observable<number | undefined>((observer) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress);
        },
        (error) => observer.error(error),
        () => {
          observer.complete();
        }
      );
    });
  }

  deleteMemorysFolder(memoryId: string): Observable<void> {
    const path = `memories/${memoryId}`;
    const storageRef = ref(this.storage, path);


    return from(listAll(storageRef)).pipe(
      switchMap((result) => {
        const itemRefs = result.items;
        if (result.items.length === 0) {
          return of(void 0); // If folder is empty, resolve immediately
        }
        const billingUpdate$ = this._processAndNotifyBilling(itemRefs);


        // Create an array of delete operations as observables
        const deletionObservables = itemRefs.map((itemRef) => from(deleteObject(itemRef)));
        billingUpdate$.subscribe();
        return forkJoin(deletionObservables).pipe(switchMap(() => of(void 0)));
      }),
      finalize(() => console.log(`Folder ${path} deleted successfully.`))
    );
  }

  deleteImages(imageUrls: string[]): Observable<void> {
    if (!imageUrls || imageUrls.length === 0) {
      console.log("No images provided for deletion.");
      return of(void 0);
    }

    // 1. Convert URLs to StorageReference objects
    const imageRefs: StorageReference[] = imageUrls.map(url => ref(this.storage, url));

    // 2. Trigger the private method to collect metadata and notify the backend
    //    We use .subscribe() to execute the notification without blocking the main deletion process.
    this._processAndNotifyBilling(imageRefs).subscribe({
      next: () => console.log('Billing notification for single image deletion triggered.'),
      error: (err) => console.error('Error in billing notification for single images:', err)
    });

    // 3. Prepare the deletion observables
    const deletionObservables = imageRefs.map((imageRef) => from(deleteObject(imageRef)));

    // 4. Execute all deletions concurrently and return the final observable
    return forkJoin(deletionObservables).pipe(
      switchMap(() => of(void 0)), // Ensure the final result is void
      finalize(() => console.log(`Deleted ${imageUrls.length} images successfully.`))
    );
  }

  private _processAndNotifyBilling(itemRefs: StorageReference[]): Observable<any> {
    // Create an array of observables to fetch metadata for each file
    const metadataObservables: Observable<any>[] = itemRefs.map((itemRef) =>
      from(getMetadata(itemRef))
    );

    // Fetch all metadata concurrently
    return forkJoin(metadataObservables).pipe(
      switchMap((metadataArray: any[]) => {
        if (metadataArray.length === 0) {
          //implement error handling
        }

        // Create the array with just the needed data
        const deletionData: DeletionData[] = metadataArray.map(meta => ({
          size: meta.size,
          userId: meta.customMetadata ? meta.customMetadata['userId'] : undefined,
          path: meta.fullPath
        }));

        console.log(`Attempting to notify billing service for ${deletionData.length} items.`);

        return from(this.billingService.updateStorageOnDeletion(deletionData)).pipe(
          finalize(() => console.log('Billing service update notification completed.')),
        );
      })
    );
  }

  starImage(index: number, starredIndex: number | null, oldStarredImageUrl: string, newStarredImageUrl: string,) {
    // Unstar the previously starred image if there is one
    if (starredIndex !== null && starredIndex !== index) {
      const prevImageRef = ref(this.storage, oldStarredImageUrl);
      getMetadata(prevImageRef).then((metadata) => {
        const updatedMetadata = { customMetadata: { ...metadata.customMetadata, isStarred: 'false' } };
        updateMetadata(prevImageRef, updatedMetadata);
        console.log("Unstarred!: ", prevImageRef, updatedMetadata);
      });
    }

    // Star the new image
    const newImageRef = ref(this.storage, newStarredImageUrl);  // Use the full path of the new image
    getMetadata(newImageRef).then((metadata) => {
      const updatedMetadata = { customMetadata: { ...metadata.customMetadata, isStarred: 'true' } };
      updateMetadata(newImageRef, updatedMetadata).then(() => {
        console.log("Starred!: ", newImageRef, updatedMetadata);
      });
    });
  }
}

