import { Injectable } from '@angular/core';
import { Auth, UserCredential, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { catchError, from, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InsertStandardResult } from '../models/api-responses.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private auth: Auth,
    private http: HttpClient
  ) { }

  signIn(params: SignIn): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(
      this.auth, params.email, params.password
    )).pipe(
      catchError((error: FirebaseError) => 
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }


  private apiUrl = `${environment.apiUrl}/users`;
  registerNew(params: SignIn): Observable<InsertStandardResult> {
    const body = { email: params.email, password: params.password };
    return this.http.post<InsertStandardResult>(`${this.apiUrl}`, body);
  }

  recoverPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      catchError((error: FirebaseError) => 
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }

  private translateFirebaseErrorMessage({code, message}: FirebaseError) {
    if (code === "auth/user-not-found") {
      return "User not found.";
    }
    if (code === "auth/wrong-password") {
      return "User not found.";
    }
    return message;
  }

}

interface SignIn {
  email: string;
  password: string;
}

interface FirebaseError {
  code: string;
  message: string
}