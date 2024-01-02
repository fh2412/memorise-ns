import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockUserService {
  private mockUser = {
    name: 'John Doe',
    age: 30,
    gender: 'Male',
    // location: 'Test Address, Test City'
    // Add more properties as needed for testing
  };

  constructor() {}

  getUser(): Observable<any> {
    return of(this.mockUser);
  }

  updateUser(userData: any): Observable<any> {
    this.mockUser = { ...this.mockUser, ...userData };
    return of(this.mockUser);
  }
}
