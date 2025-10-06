import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';

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

  updateFreeUserStorageUsed(user_id: string, data_size: number): Observable<any> {
    console.log("updateFreeUserStorageUsed", user_id, data_size);
    return this.http.put(`${this.apiUrl}/freetier/${user_id}`, { data_size });
  }

  async updateStorageOnDeletion(dataArray: DeletionData[]): Promise<void> {
    if (dataArray.length === 0) {
      return;
    }

    const updatePromises: Promise<any>[] = dataArray.map(del => {
      const updateObservable = this.updateFreeUserStorageUsed(del.userId, -del.size);
      return firstValueFrom(updateObservable);
    });

    try {
      await Promise.all(updatePromises);
      console.log("All storage updates completed successfully.");
    } catch (error) {
      console.error("One or more storage updates failed:", error);
      throw error;
    }
  }
}