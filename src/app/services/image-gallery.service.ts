import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ImageWithMetadata } from '../pages/memory-detail/memory-detail.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ImageDownloadInfo {
  folderPath: string;  // e.g., "memories/NPFiASPHZPTT5FkwnKK5VHwWncq21735889461028"
  fileName: string;    // e.g., "picture_3.jpg"
  token: string;       // e.g., "031165de-546a-4bf5-8c0d-9473b01c15d5"
}

@Injectable({
  providedIn: 'root'
})
export class ImageGalleryService {
  private imageDataSource = new BehaviorSubject<ImageWithMetadata[]>([]);
  currentImageData = this.imageDataSource.asObservable();

  constructor(private http: HttpClient) { }


  // Method to update the data
  updateImageData(images: ImageWithMetadata[]) {
    this.imageDataSource.next(images);
  }

  downloadImage(url: string): Promise<Blob> {
    return fetch(url).then((response) => response.blob());
  }

  downloadZip(folderName: string, title: string): Observable<Blob> {
    return this.http
      .get(`${environment.apiUrl}/firestore/download-zip/${folderName}`, { responseType: 'blob' })
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

  downloadSelectedZip(images: ImageWithMetadata[], title: string): Observable<Blob> {
    // Parse URLs and extract components
    const imageInfos: ImageDownloadInfo[] = images
      .map(img => {
        const parsed = this.parseFirebaseStorageUrl(img.url);
        return parsed;
      })
      .filter(info => info !== null) as ImageDownloadInfo[];

    if (imageInfos.length === 0) {
      return throwError(() => new Error('No valid image URLs found'));
    }

    return this.http.post(`${environment.apiUrl}/firestore/download-selected-zip`,
      { images: imageInfos },
      { responseType: 'blob' }
    ).pipe(
      tap((response) => {
        const downloadLink = document.createElement('a');
        const blob = new Blob([response], { type: 'application/zip' });
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = `${title}.zip`;
        downloadLink.click();
      }),
      catchError((error) => {
        console.error('Error downloading images', error);
        return throwError(() => error);
      })
    );
  }

  private parseFirebaseStorageUrl(url: string): ImageDownloadInfo | null {
    try {
      const urlObj = new URL(url);

      // Extract the path (between /o/ and ?)
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
      if (!pathMatch) return null;

      const encodedPath = pathMatch[1];
      const decodedPath = decodeURIComponent(encodedPath);

      // Split into folder and filename
      const lastSlashIndex = decodedPath.lastIndexOf('/');
      const folderPath = decodedPath.substring(0, lastSlashIndex);
      const fileName = decodedPath.substring(lastSlashIndex + 1);

      // Extract token
      const token = urlObj.searchParams.get('token');
      if (!token) return null;

      return {
        folderPath,
        fileName,
        token,
      };
    } catch (error) {
      console.error('Error parsing Firebase Storage URL:', error);
      return null;
    }
  }
}
