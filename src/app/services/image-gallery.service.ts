import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { BehaviorSubject } from 'rxjs';
import { saveAs } from 'file-saver';

interface ImageData {
  url: string;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageGalleryService {
  // BehaviorSubject will hold the current value and emit it to subscribers whenever it changes
  private imageDataSource = new BehaviorSubject<ImageData[]>([]);
  currentImageData = this.imageDataSource.asObservable(); // Observable to allow subscription

  // Method to update the data
  updateImageData(images: ImageData[]) {
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
}
