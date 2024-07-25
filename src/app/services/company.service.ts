import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id?: number;
  name: string;
  phone: string;
  email: string;
  website: string;
}

@Injectable({
  providedIn: 'root'
})
export class companyService {
  private apiUrl = 'http://localhost:3000/api/company';

  constructor(private http: HttpClient) {}

  getUserCompany(user_id: string) {
    return this.http.get<any>(`${this.apiUrl}/${user_id}`);
  }

  leaveCompany(user_id: string) {
    return this.http.put<any>(`${this.apiUrl}/leave/${user_id}`, {});
  }

  deleteCompany(company_id: string) {
    return this.http.delete<any>(`${this.apiUrl}/delete/${company_id}`);
  }
  
  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/create`, company);
  }

  updateCompany(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/update/${id}`, company);
  }
}
