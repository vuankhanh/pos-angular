import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { IRefreshTokenResponse, ITokenResponse } from '../../interface/token.interface';
import { IAdminConfigResponse } from '../../interface/admin_config.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url: string = environment.backendApi+'/auth';
  constructor(
    private httpClient: HttpClient
  ) { }
  
  login(username: string, password: string){
    const data = { username, password }
    return this.httpClient.post<ITokenResponse>(this.url+'/login', data);
  }

  refreshToken(refreshToken: string){
    const data = { refreshToken }
    return this.httpClient.post<IRefreshTokenResponse>(this.url+'/refresh_token', data);
  }

  checkToken(){
    return this.httpClient.post<IAdminConfigResponse>(this.url+'/config', null);
  }
}
