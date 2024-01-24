import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask  } from '@angular/fire/compat/storage';

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
    const path = `profile-pictures/${userId}/profile.jpg`; // adjust the path as needed
    const ref = this.storage.ref(path);
    const task: AngularFireUploadTask = ref.put(file);

    // Use Observable to track the upload progress
    return task.percentageChanges();
  }

  getProfilePictureUrl(userId: string): Promise<string> {
    const path = `profile-pictures/${userId}/profile.jpg`; // adjust the path as needed
    const ref = this.storage.ref(path);

    return ref.getDownloadURL().toPromise();
  }

  uploadMemoryPictures(memoryId: string, files: File[]): Observable<number[]> {
    const uploadTasks: AngularFireUploadTask[] = [];
    const progressObservables: Observable<number | undefined>[] = [];

    // Upload each file
    files.forEach((file, index) => {
      const path = `memories/${memoryId}/picture_${index + 1}.jpg`; // adjust the path as needed
      const ref = this.storage.ref(path);
      const task: AngularFireUploadTask = ref.put(file);

      uploadTasks.push(task);
      progressObservables.push(task.percentageChanges().pipe(map(value => value || 0)));
    });

    // Combine progress observables using forkJoin and map to transform the array
    const combinedProgress$: Observable<number[]> = forkJoin(progressObservables).pipe(
      map(values => values as number[])
    );

    // Return the combined progress observable
    return combinedProgress$;
  }
}

