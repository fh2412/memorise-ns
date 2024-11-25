import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { BehaviorSubject } from 'rxjs';
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

  // Function to download all images and zip them
  async downloadImagesAsZip(urls: string[], zipFileName: string): Promise<void> {
    const zip = new JSZip();

    // Download each image and add it to the zip
    const promises = urls.map(async (url, index) => {
      const imageBlob = await this.downloadImage(url);
      zip.file(`image${index + 1}.jpg`, imageBlob);
    });

    // Wait for all images to be downloaded and added to the zip
    await Promise.all(promises);

    // Generate the zip and trigger the download
    zip.generateAsync({ type: 'blob' }).then((zipFile) => {
      saveAs(zipFile, `${zipFileName}.zip`);
    });
  }

  downloadZip(folderName: string, title: string): void {
    this.http
      .get(`http://localhost:3000/api/firestore/download-zip/${folderName}`, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        // Trigger file download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Cleanup URL
        URL.revokeObjectURL(url);
      });
  }
}
