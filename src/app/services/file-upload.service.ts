import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, filter, finalize, forkJoin, map, switchMap } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask  } from '@angular/fire/compat/storage';
import { deleteObject, getStorage, ref } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private storage: AngularFireStorage) {}

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }

  uploadProfilePicture(userId: string, file: File): Observable<number | undefined> {
    const path = `profile-pictures/${userId}/profile.jpg`;
    const ref = this.storage.ref(path);
    const task: AngularFireUploadTask = ref.put(file);

    // Use Observable to track the upload progress
    return task.percentageChanges();
  }

  uploadMemoryPicture(memoryId: string, file: File, count: string, index: number): Observable<number | undefined> {
    const countP = parseInt(count);

    const path = `memories/${memoryId}/picture_${index + countP + 1}.jpg`;
    const ref = this.storage.ref(path);
    const task: AngularFireUploadTask = ref.put(file);

    // Use Observable to track the upload progress
    return task.percentageChanges();
  }

  getProfilePictureUrl(userId: string): Promise<string> {
    const path = `profile-pictures/${userId}/profile.jpg`;
    const ref = this.storage.ref(path);

    return ref.getDownloadURL().toPromise();
  }

  uploadMemoryPictures(memoryId: string, files: File[], count: string): Observable<number[]> {
       const uploadTasks: AngularFireUploadTask[] = [];
       const progressObservables: Observable<number | undefined>[] = [];
   
       const countP = parseInt(count);
   
       // Upload each file and track progress
       const fileProgress: { [index: number]: number } = {};
       files.forEach((file, index) => {
         const path = `memories/${memoryId}/picture_${index + countP + 1}.jpg`;
         const ref = this.storage.ref(path);
         const task: AngularFireUploadTask = ref.put(file);
   
         uploadTasks.push(task);
   
         progressObservables.push(task.percentageChanges().pipe(
          map(progress => {
            fileProgress[index] = progress ?? 0;
            return progress;
          })
        ));
       });
   
       const combinedProgress: Observable<number[]> = forkJoin(
        progressObservables.map(progress => progress.pipe(
          filter(value => value !== undefined),
          map(value => value as number)
        ))
      );
       return combinedProgress;
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
    /*const body = { urls: imageUrls };
    return this.http.post<any>('http://localhost:3000/api/firestore/delete-images', body)
      .subscribe(response => {
        console.log('Images deleted:', response);
        // Clear the imagesToDelete array and update UI
      }, error => {
        console.error('Error deleting images:', error);
        // Handle potential errors
      });*/
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

}

