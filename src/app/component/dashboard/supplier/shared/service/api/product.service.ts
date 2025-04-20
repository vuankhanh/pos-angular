import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { ISupplierProduct, ISupplierProductDetailResponse, ISupplierProductResponse } from '../../interface/supplier-product.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly url: string = environment.backendApi + '/supplier_product';
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
    return this.httpClient.get<ISupplierProductResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(id: string) {
    return this.httpClient.get<ISupplierProductDetailResponse>(this.url + '/' + id).pipe(
      map(res => res.metaData)
    );
  }

  create(supplierProduct: ISupplierProduct) {
    return this.httpClient.post<ISupplierProductDetailResponse>(this.url, supplierProduct).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<ISupplierProduct>) {
    return this.httpClient.patch<ISupplierProductDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, data: ISupplierProduct) {
    return this.httpClient.put<ISupplierProductDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  remove(id: string) {
    return this.httpClient.delete<ISupplierProductDetailResponse>(this.url + '/' + id);
  }
}
