import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask  } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private storage: AngularFireStorage) { }

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
}
