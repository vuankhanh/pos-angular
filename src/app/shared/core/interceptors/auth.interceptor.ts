import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../../service/auth_state.service';
import { AuthService } from '../../service/api/auth.service';
import { LocalStorageKey } from '../../../constant/local_storage.constant';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  constructor(
    private authStateService: AuthStateService,
    private authService: AuthService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = localStorage.getItem(LocalStorageKey.ACCESSTOKEN);
    if (accessToken) {
      const cloned = request.clone({
        headers: request.headers.set("authorization", "Bearer " + accessToken)
      });
      return next.handle(cloned).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && !request.url.includes('/login') && error.status === 401) {
            return this.handle401Error(request, next)
          }

          return throwError(() => error);
        })
      );
    }
    return next.handle(request);
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      const refreshToken = localStorage.getItem(LocalStorageKey.REFRESHTOKEN);
      const isLogin = this.authStateService.isLogin;
      if (isLogin) {
        const refreshTokenRequest = this.authService.refreshToken(refreshToken!)
        return refreshTokenRequest.pipe(
          switchMap((accessToken) => {
            localStorage.setItem(LocalStorageKey.ACCESSTOKEN, accessToken);
            this.isRefreshing = false;
            const cloned = request.clone({
              headers: request.headers.set("authorization", "Bearer " + accessToken)
            });
            return next.handle(cloned);
          }),
          catchError((error) => {
            this.isRefreshing = false;
            if (error.status == '403') {
              this.authStateService.logout();
            }

            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }
}
