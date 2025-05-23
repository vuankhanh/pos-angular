import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ISupplierDebt, ISupplierLocation, ISupplierLocationDebtResponse, ISupplierLocationDetailResponse, ISupplierLocationResponse, TSupplierLocationModel } from '../../interface/supplier-location.interface';
import { EMPTY, expand, map, Observable, tap, toArray } from 'rxjs';
import { IPagination } from '../../../../../../shared/interface/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
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
    return this.httpClient.get<ISupplierLocationResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getAllData() {
    let page = 1;
    return this.getAll().pipe(
      expand(metaData => {
        page++;
        const paging = metaData.paging;
        return page <= paging.totalPages ? this.getAll('', page) : EMPTY
      }),
      toArray(),
      map((arr: Array<{
        data: Array<TSupplierLocationModel>,
        paging: IPagination
      }>) => {
        const data = arr.map(res=>res.data).flat();
        return data;
      })
    );
  }

  getDetail(id: string) {
    return this.httpClient.get<ISupplierLocationDetailResponse>(this.url + '/' + id).pipe(
      map(res => res.metaData)
    );
  }

  create(supplier: ISupplierLocation) {
    return this.httpClient.post<ISupplierLocationDetailResponse>(this.url, supplier).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<ISupplierLocation>) {
    return this.httpClient.patch<ISupplierLocationDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  getDebtBySupplierId(id: string) {
    return this.httpClient.get<ISupplierLocationDebtResponse>(this.url + '/' + id + '/debt').pipe(
      map(res => res.metaData)
    );
  }

  updateDebt(id: string, data: ISupplierDebt) {
    return this.httpClient.patch<ISupplierLocationDetailResponse>(this.url + '/' + id + '/debt/update', data).pipe(
      map(res => res.metaData)
    );
  }

  clearDebt(id: string) {
    return this.httpClient.patch<ISupplierLocationDetailResponse>(this.url + '/' + id + '/debt/clear', null).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, data: ISupplierLocation) {
    return this.httpClient.put<ISupplierLocationDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  remove(id: string) {
    return this.httpClient.delete<ISupplierLocationDetailResponse>(this.url + '/' + id);
  }
}
