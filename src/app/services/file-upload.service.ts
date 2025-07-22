import { inject, Injectable } from '@angular/core';
import { Observable, finalize, forkJoin, from, of, switchMap } from 'rxjs';
import { deleteObject, getMetadata, Storage, ref, updateMetadata, uploadBytesResumable, listAll, getDownloadURL } from '@angular/fire/storage';
import { ImageFileWithDimensions } from '../components/image-upload/image-upload.component';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private storage = inject(Storage);


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
        if (result.items.length === 0) {
          return of(void 0); // If folder is empty, resolve immediately
        }

        // Create an array of delete operations as observables
        const deletionObservables = result.items.map((itemRef) => from(deleteObject(itemRef)));

        return forkJoin(deletionObservables).pipe(switchMap(() => of(void 0)));
      }),
      finalize(() => console.log(`Folder ${path} deleted successfully.`))
    );
  }

  deleteImages(imageUrls: string[]) {
    // Create a reference to the file to delete
    const desertRef = ref(this.storage, imageUrls[0]);

    // Delete the file
    deleteObject(desertRef).then(() => {
      console.log("deleted images sucessfully");
    }).catch((error) => {
      console.log(error);
    });
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

