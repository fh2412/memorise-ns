import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

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
    updateFreeUserStorageUsedRemove(user_id: string, data_size: number) {
        return this.http.put<any>(`${this.apiUrl}/freetier/${user_id}`, {data_size: data_size});
    }

}