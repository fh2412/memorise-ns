import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MemoriseCompany } from '../models/company.model';

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

  setCompanyOwner(user_id: string, company_id: string) {
    return this.http.put<any>(`${this.apiUrl}/owner/${user_id}`, {companyId: company_id});
  }

  deleteCompany(company_id: number) {
    return this.http.delete<MemoriseCompany>(`${this.apiUrl}/delete/${company_id}`);
  }
  
  createCompany(id: string, company: MemoriseCompany): Observable<MemoriseCompany> {
    return this.http.post<MemoriseCompany>(`${this.apiUrl}/create/${id}`, company);
  }

  updateCompany(id: number, company: MemoriseCompany): Observable<MemoriseCompany> {
    return this.http.put<MemoriseCompany>(`${this.apiUrl}/update/${id}`, company);
  }

  generateCode(companyId: number){
    return this.http.post<any>(`${this.apiUrl}/generateCode/${companyId}`, {});
  }
}
