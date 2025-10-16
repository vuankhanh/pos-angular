import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageKey } from '../../constant/local_storage.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  constructor(
    private router: Router
  ) { }

  get isLogin(): boolean{
    const refreshToken = localStorage.getItem(LocalStorageKey.ACCESSTOKEN);
    return refreshToken ? true : false;
  }
  logout(){
    localStorage.removeItem(LocalStorageKey.ACCESSTOKEN);
    localStorage.removeItem(LocalStorageKey.REFRESHTOKEN);
    this.router.navigate(['/login']);
  }
}
