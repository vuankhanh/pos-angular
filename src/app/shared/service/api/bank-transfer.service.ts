import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { IBank, IBankResponse } from '../../interface/bank-transfer.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankTransferService {
  private readonly httpClient = inject(HttpClient)
  private readonly url: string = environment.backendApi + '/viet-qr-api'

  getAll(): Observable<IBank[]> {
    return this.httpClient.get<IBankResponse>(this.url + '/banks').pipe(
      map(res => res.metaData)
    );
  }

  generateQrCode(bankBin: string, accountNumber: string, accountName: string, amount: number, addInfo: string): Observable<Blob> {
    let params = new HttpParams();
    params = params.append('bankBin', bankBin);
    params = params.append('accountNumber', accountNumber);
    params = params.append('accountName', accountName);
    params = params.append('amount', amount);
    params = params.append('addInfo', addInfo);

    return this.httpClient.get(this.url + '/generate-qr-code', { params, responseType: 'blob' });
  }
}
