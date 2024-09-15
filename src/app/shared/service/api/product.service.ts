import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { IProduct, IProductDetailRespone, IProductResponse } from '../../interface/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url: string = environment.backendApi + '/product';
  constructor(
    private httpClient: HttpClient
  ) { }

  getAll(name?: string, page?: number, size?: number){
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
    return this.httpClient.get<IProductResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(id: string){
    return this.httpClient.get<IProductDetailRespone>(this.url + '/'+ id).pipe(
      map(res => res.metaData)
    );
  }

  create(data: IProduct){
    return this.httpClient.post<IProductDetailRespone>(this.url, data).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<IProduct>){
    return this.httpClient.patch<IProductDetailRespone>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, data: IProduct){
    return this.httpClient.put<IProductDetailRespone>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  remove(id: string){
    return this.httpClient.delete<IProductDetailRespone>(this.url + '/' + id).pipe(
      map(res => res.metaData)
    );
  }
}
