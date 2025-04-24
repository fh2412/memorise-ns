import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivityCreator, ActivityDetails, ActivityFilter, ActivityStats, CreateActivityResponse, MemoriseActivity, MemoriseUserActivity } from '../models/activityInterface.model';
import { environment } from '../../environments/environment';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
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

  getActivity(activityId: number) {
    return this.http.get<MemoriseActivity>(`${this.apiUrl}/${activityId}`);
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

  getFilteredActivities(filter: ActivityFilter): Observable<MemoriseUserActivity[]> {
    // Convert filter object to HttpParams
    let params = new HttpParams();
    
    // Only add parameters that have values
    if (filter.location) {
      params = params.set('location', filter.location);
    }
    
    if (filter.distance !== undefined) {
      params = params.set('distance', filter.distance.toString());
    }
    
    if (filter.tag) {
      params = params.set('tag', filter.tag);
    }
    
    if (filter.groupSizeMin !== undefined) {
      params = params.set('groupSizeMin', filter.groupSizeMin.toString());
    }
    
    if (filter.groupSizeMax !== undefined) {
      params = params.set('groupSizeMax', filter.groupSizeMax.toString());
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
        (snapshot) => {console.log(snapshot.state);},
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

  // Upload supporting documents
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

  // Update activity with document URLs
  updateActivityWithDocuments(activityId: string, titlePictureUrl: string): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/update-activity/${activityId}`;
    const updateData = {
      titlePictureUrl
    };
    
    return this.http.put<UpdateStandardResponse>(url, updateData);
  }
}