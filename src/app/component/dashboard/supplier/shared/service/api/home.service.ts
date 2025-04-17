import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ISupplier, ISupplierDetailResponse, ISupplierResponse } from '../../interface/supplier.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly url: string = environment.backendApi + '/supplier';
  constructor() { }

  getAll(name?: string, page?: number, size?: number) {
    let params = new HttpParams();
    if (name != undefined) {
      params = params.append('name', name)
    }
    if (page != undefined) {
      params = params.append('page', page)
    }
    if (size != undefined) {
      params = params.append('size', size)
    }
    return this.httpClient.get<ISupplierResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(id: string) {
    return this.httpClient.get<ISupplierDetailResponse>(this.url + '/' + id).pipe(
      map(res => res.metaData)
    );
  }

  create(supplier: ISupplier) {
    return this.httpClient.post<ISupplierDetailResponse>(this.url, supplier).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<ISupplier>) {
    return this.httpClient.put<ISupplierDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, data: ISupplier){
      return this.httpClient.put<ISupplierDetailResponse>(this.url + '/' + id, data).pipe(
        map(res => res.metaData)
      );
    }

  remove(id: string) {
    return this.httpClient.delete<ISupplierDetailResponse>(this.url + '/' + id);
  }
}
