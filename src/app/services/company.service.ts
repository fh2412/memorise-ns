import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MemoriseCompany } from '../models/company.model';
import { DeleteStandardResponse, InsertStandardResult, UpdateStandardResponse } from '../models/api-responses.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class companyService {
  private apiUrl = `${environment.apiUrl}/company`;

  constructor(private http: HttpClient) {}

  getUserCompany(user_id: string) {
    return this.http.get<MemoriseCompany>(`${this.apiUrl}/${user_id}`);
  }

  leaveCompany(user_id: string) {
    return this.http.put<UpdateStandardResponse>(`${this.apiUrl}/leave/${user_id}`, {});
  }

  setCompanyOwner(user_id: string, company_id: string) {
    return this.http.put<UpdateStandardResponse>(`${this.apiUrl}/owner/${user_id}`, {companyId: company_id});
  }

  deleteCompany(company_id: number) {
    return this.http.delete<DeleteStandardResponse>(`${this.apiUrl}/delete/${company_id}`);
  }
  
  createCompany(id: string, company: MemoriseCompany): Observable<InsertStandardResult> {
    return this.http.post<InsertStandardResult>(`${this.apiUrl}/create/${id}`, company);
  }

  updateCompany(id: number, company: MemoriseCompany): Observable<MemoriseCompany> {
    return this.http.put<MemoriseCompany>(`${this.apiUrl}/update/${id}`, company);
  }

  generateCode(companyId: number){
    return this.http.post<{code: string}>(`${this.apiUrl}/generateCode/${companyId}`, {});
  }
}
