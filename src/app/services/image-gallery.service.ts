import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { saveAs } from 'file-saver';
import { ImageWithMetadata } from '../pages/memory-detail/memory-detail.component';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ImageGalleryService {
  private imageDataSource = new BehaviorSubject<ImageWithMetadata[]>([]);
  currentImageData = this.imageDataSource.asObservable();

  constructor(private http: HttpClient) {}


  // Method to update the data
  updateImageData(images: ImageWithMetadata[]) {
    this.imageDataSource.next(images); // Update the BehaviorSubject with new data
  }

  downloadImage(url: string): Promise<Blob> {
    return fetch(url).then((response) => response.blob());
  }

  downloadZip(folderName: string, title: string): Observable<Blob> {
    return this.http
      .get(`http://localhost:3000/api/firestore/download-zip/${folderName}`, { responseType: 'blob' })
      .pipe(
        tap((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        })
      );
  }
  
}
