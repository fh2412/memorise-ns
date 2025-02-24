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
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {console.log(snapshot.state);},
        (error) => {
          console.log("ERROR IN SERVIE: ", error);
          observer.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          observer.next(downloadURL);
          observer.complete();
        }
      );
    });
  }

  uploadMemoryPicture(memoryId: string, file: ImageFileWithDimensions, count: number, index: number, isStarred: boolean): Observable<number | undefined> {
    const path = `memories/${memoryId}/picture_${index + count + 1}.jpg`;
    const storageRef = ref(this.storage, path);

    // Define metadata with custom dimensions
    const metadata = {
      customMetadata: {
        width: file.width.toString(),
        height: file.height.toString(),
        isStarred: isStarred.toString()
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

