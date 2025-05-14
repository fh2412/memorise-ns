import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getAuth, User } from '@angular/fire/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    const auth = getAuth();
    
    return from(
      new Promise<User | null>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe(); // prevent memory leaks
          resolve(user);
        });
      })
    ).pipe(
      switchMap((user) => {
        if (user) {
          return from(user.getIdToken()).pipe(
            switchMap((token: string) => {
              const clonedRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return next.handle(clonedRequest);
            })
          );
        }
        return next.handle(request);
      })
    );
  }
}