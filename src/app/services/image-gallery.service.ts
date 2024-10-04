import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
}
