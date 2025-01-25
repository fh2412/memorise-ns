import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, from, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InsertStandardResult } from '../models/api-responses.model';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private auth: AngularFireAuth,
    private http: HttpClient
  ) { }

  signIn(params: SignIn): Observable<firebase.default.auth.UserCredential> {
    return from(this.auth.signInWithEmailAndPassword(
      params.email, params.password
    )).pipe(
      catchError((error: FirebaseError) => 
        throwError(() => new Error(this.translateFirebaseErrorMessage(error)))
      )
    );
  }


  private apiUrl = 'http://localhost:3000/api/users';
  registerNew(params: SignIn): Observable<InsertStandardResult> {
    const body = { email: params.email, password: params.password };
    return this.http.post<InsertStandardResult>(`${this.apiUrl}`, body);
  }

  recoverPassword(email: string): Observable<void> {
    return from(this.auth.sendPasswordResetEmail(email)).pipe(
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