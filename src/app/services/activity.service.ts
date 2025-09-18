import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivityCreator, ActivityDetails, ActivityFilter, ActivityStats, CreateActivityResponse, MemoriseUserActivity } from '../models/activityInterface.model';
import { environment } from '../../environments/environment';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { forkJoin, Observable } from 'rxjs';
import { UpdateStandardResponse } from '../models/api-responses.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private storage = inject(Storage);
  private apiUrl = `${environment.apiUrl}/activity`;

  constructor(private http: HttpClient) { }

  createActivity(activityData: MemoriseUserActivity): Observable<CreateActivityResponse> {
    const url = `${this.apiUrl}/add-user-activity`;
    return this.http.post<CreateActivityResponse>(url, activityData);
  }

  createQuickActivity(title: string) {
    const url = `${this.apiUrl}/add-activity`;
    const body = { title };
    return this.http.post<CreateActivityResponse>(url, body);
  }

  getActivityDetails(activityId: number | string): Observable<ActivityDetails> {
    return this.http.get<ActivityDetails>(`${this.apiUrl}/details/${activityId}`);
  }

  getActivityCreator(activityId: number, userId: string): Observable<ActivityCreator> {
    return this.http.get<ActivityCreator>(`${this.apiUrl}/creatorDetails/${activityId}/${userId}`);
  }

  getUsersActivities(userId: string) {
    return this.http.get<MemoriseUserActivity[]>(`${this.apiUrl}/userActivities/${userId}`);
  }

  getSugggestedActivities(userId: string) {
    return this.http.get<MemoriseUserActivity[]>(`${this.apiUrl}/suggestedActivities/${userId}`);
  }

  getFilteredActivities(filter: ActivityFilter, loggedInUserId: string): Observable<MemoriseUserActivity[]> {
    // Convert filter object to HttpParams
    let params = new HttpParams();

    if (loggedInUserId) {
      params = params.set('userId', loggedInUserId);
    }

    if (filter.location) {
      params = params.set('location', filter.location);
    }

    if (filter.locationCoords) {
      params = params.set('lat', filter.locationCoords.lat);
      params = params.set('lng', filter.locationCoords.lng);
    }

    if (filter.distance !== undefined) {
      params = params.set('distance', filter.distance.toString());
    }

    if (filter.groupSize !== undefined) {
      params = params.set('groupSize', filter.groupSize.toString());
    }

    if (filter.price !== undefined) {
      params = params.set('price', filter.price.toString());
    }

    if (filter.season) {
      params = params.set('season', filter.season);
    }

    if (filter.weather) {
      params = params.set('weather', filter.weather);
    }

    if (filter.name) {
      params = params.set('name', filter.name);
    }

    if (filter.activityType) {
      params = params.set('activityType', filter.activityType);
    }

    console.log(params);

    return this.http.get<MemoriseUserActivity[]>(`${this.apiUrl}/filtered`, { params });
  }

  getActivityStats(userId: string): Observable<ActivityStats> {
    return this.http.get<ActivityStats>(`${this.apiUrl}/stats/${userId}`);
  }

  uploadTitlePicture(file: File, activityId: string): Observable<string> {
    return new Observable((observer) => {
      const filePath = `activities/${activityId}/thumbnail.jpg`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => { console.log(snapshot.state); },
        (error) => {
          console.error("Title picture upload error:", error);
          observer.error(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            observer.next(downloadURL);
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }
      );
    });
  }

  changeTitlePicture(file: File, activityId: string, oldImageUrl: string): Observable<string> {
    return new Observable((observer) => {
      // Step 1: Delete the old image from Firebase
      if (oldImageUrl) {
        const oldImageRef = ref(this.storage, oldImageUrl);
        deleteObject(oldImageRef).catch(error => {
          console.warn('Old image could not be deleted:', error);
          // continue regardless
        });
      }
      // Step 2: Upload the new image
      const filePath = `activities/${activityId}/thumbnail.jpg`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => { console.log(snapshot.state); },
        (error) => {
          console.error("Title picture update upload error:", error);
          observer.error(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            console.log("URL: ", downloadURL);
            // Step 3: Call backend to update the image URL
            this.http.put(`${this.apiUrl}/update-thumbmail/${activityId}`, { imageUrl: downloadURL }).subscribe({
              next: () => {
                observer.next(downloadURL);
                observer.complete();
              },
              error: (err) => {
                console.error("Failed to update backend with new image URL:", err);
                observer.error(err);
              }
            });
          } catch (error) {
            observer.error(error);
          }
        }
      );
    });
  }

  uploadSupportingDocuments(files: File[], activityId: string): Observable<string[]> {
    if (!files || files.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const uploads: Observable<string>[] = files.map((file, index) => {
      return new Observable<string>(observer => {
        const filePath = `activities/${activityId}/docs/supporting-doc-${index}-${file.name}`;
        const storageRef = ref(this.storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Document ${index + 1} upload progress: ${progress}%`);
          },
          (error) => {
            console.error(`Document ${index + 1} upload error:`, error);
            observer.error(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              observer.next(downloadURL);
              observer.complete();
            } catch (error) {
              observer.error(error);
            }
          }
        );
      });
    });

    return forkJoin(uploads);
  }

  updateActivityWithDocuments(activityId: string, titlePictureUrl: string): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/update-activity/${activityId}`;
    const updateData = {
      titlePictureUrl
    };

    return this.http.put<UpdateStandardResponse>(url, updateData);
  }

  archiveActivity(activityId: string) {
    const url = `${this.apiUrl}/archive-activity/${activityId}`;

    return this.http.put<UpdateStandardResponse>(url, {});
  }

  updateUserActivity(activityId: string, activityData: MemoriseUserActivity): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/update-user-activity/${activityId}`;
    return this.http.put<UpdateStandardResponse>(url, activityData);
  }

  updateMemoriesActivity(activityId: number, memoryId: string): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/update-memory-activity/${memoryId}`;
    const updateData = {
      activityId
    };

    return this.http.put<UpdateStandardResponse>(url, updateData);
  }
}