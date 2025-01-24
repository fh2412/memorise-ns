import { Injectable } from '@angular/core';
import { Observable, finalize, firstValueFrom, last, map, switchMap } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { deleteObject, getMetadata, getStorage, ref, updateMetadata } from 'firebase/storage';
import { ImageFileWithDimensions } from '../components/image-upload/image-upload.component';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private storage: AngularFireStorage) { }


  uploadProfilePicture(userId: string, file: File): Observable<void> {
    const path = `profile-pictures/${userId}/profile.jpg`;
    const ref = this.storage.ref(path);
    const task: AngularFireUploadTask = ref.put(file);
  
    // Track the task and complete the observable only on successful upload
    return task.snapshotChanges().pipe(
      last(), // Take only the last emitted value (when the upload is complete)
      map(() => void 0) // Map the final snapshot to void, as we only care about completion
    );
  }

  uploadMemoryPicture(memoryId: string, file: ImageFileWithDimensions, count: number, index: number, isStarred: boolean): Observable<number | undefined> {
    const path = `memories/${memoryId}/picture_${index + count + 1}.jpg`;
    const ref = this.storage.ref(path);

    // Define metadata with custom dimensions
    const metadata = {
      customMetadata: {
        width: file.width.toString(),
        height: file.height.toString(),
        isStarred: isStarred.toString()
      }
    };

    // Upload the file with metadata
    const task: AngularFireUploadTask = ref.put(file.file, metadata);

    // Use Observable to track the upload progress
    return task.percentageChanges();
  }

  getProfilePictureUrl(userId: string): Promise<string> {
    const path = `profile-pictures/${userId}/profile.jpg`;
    const ref = this.storage.ref(path);

    return firstValueFrom(ref.getDownloadURL());
  }

  deleteMemorysFolder(memoryId: string): Observable<void[]> {
    const path = `memories/${memoryId}`;
    const storageRef = this.storage.ref(path);

    return storageRef.listAll().pipe(
      switchMap((result) => {
        // Delete each item in the folder
        const deletionPromises: Promise<void>[] = result.items.map((itemRef) => itemRef.delete());
        return Promise.all(deletionPromises);
      }),
      finalize(() => console.log(`Folder ${path} deleted successfully.`)),
    );
  }

  deleteImages(imageUrls: string[]) {
    const storage = getStorage();
    // Create a reference to the file to delete
    const desertRef = ref(storage, imageUrls[0]);

    // Delete the file
    deleteObject(desertRef).then(() => {
      console.log("deleted images sucessfully");
    }).catch((error) => {
      console.log(error);
    });
  }

  starImage(index: number, starredIndex: number | null, oldStarredImageUrl: string, newStarredImageUrl: string,){
    const storage = getStorage();
  
    // Unstar the previously starred image if there is one
    if (starredIndex !== null && starredIndex !== index) {
      const prevImageRef = ref(storage, oldStarredImageUrl);
      getMetadata(prevImageRef).then((metadata) => {
        const updatedMetadata = { customMetadata: { ...metadata.customMetadata, isStarred: 'false' } };
        updateMetadata(prevImageRef, updatedMetadata);
        console.log("Unstarred!: ", prevImageRef, updatedMetadata);
      });
    }
  
    // Star the new image
    const newImageRef = ref(storage, newStarredImageUrl);  // Use the full path of the new image
    getMetadata(newImageRef).then((metadata) => {
      const updatedMetadata = { customMetadata: { ...metadata.customMetadata, isStarred: 'true' } };
      updateMetadata(newImageRef, updatedMetadata).then(() => {
        console.log("Starred!: ", newImageRef, updatedMetadata);
      });
    });
  }
}

