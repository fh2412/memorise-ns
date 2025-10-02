import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

export interface DeletionData {
    size: number;
    userId: string;
    path: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {


    private apiUrl = `${environment.apiUrl}/billing`;


    constructor(private http: HttpClient) { }

    //Update when a User uploads new Images
    updateFreeUserStorageUsedAdd(user_id: string, data_size: number) {
        return this.http.put<any>(`${this.apiUrl}/freetier/${user_id}`, {data_size: data_size});
    }
    
    updateStorageOnDeletion(dataArray: DeletionData[]): Observable<any> {
        if (dataArray.length === 0) {
          return of(void 0);
        }
    
        return this.http.put(this.apiUrl, { deletions: dataArray });
      }
}