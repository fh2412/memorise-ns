import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getAuth } from 'firebase/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    const auth = getAuth();
    const user = auth.currentUser;

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
  }
}
