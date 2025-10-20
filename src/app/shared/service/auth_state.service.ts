import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageKey } from '../../constant/local_storage.constant';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly router = inject(Router);
  private readonly localStorageService = inject(LocalStorageService);

  get isLogin(): boolean{
    const refreshToken = this.localStorageService.get(LocalStorageKey.ACCESSTOKEN);
    return refreshToken ? true : false;
  }
  logout(){
    localStorage.removeItem(LocalStorageKey.ACCESSTOKEN);
    localStorage.removeItem(LocalStorageKey.REFRESHTOKEN);
    this.router.navigate(['/login']);
  }
}
