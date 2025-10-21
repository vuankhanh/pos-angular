import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../../service/api/auth.service';
import { LocalStorageService } from '../../service/local-storage.service';
import { LocalStorageKey } from '../../../constant/local_storage.constant';

@Injectable({
  providedIn: 'root'
})
class PermissionsService {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly localStorageService = inject(LocalStorageService);
  canActivate(): Observable<boolean> {
    const refreshToken = this.localStorageService.get(LocalStorageKey.REFRESHTOKEN);
    if (!refreshToken) {
      this.router.navigate(['/login'])
      return of(false)
    }
    return this.authService.checkToken().pipe(
      map(res => true),
      catchError(err => {
        this.router.navigate(['/login'])
        return of(false)
      }
      )
    )
  }
}

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(PermissionsService).canActivate()
};
