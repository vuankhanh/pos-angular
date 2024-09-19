import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IOrderDetailResponse, IOrderResponse, Order, OrderItem } from '../../interface/order.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private url = environment.backendApi + '/order';

  constructor(
    private httpClient: HttpClient
  ) { }

  getAll(nameOrOrderCode?: string, page?: number, size?: number){
    let params = new HttpParams();
    if (nameOrOrderCode != undefined) {
      params = params.append('nameOrOrderCode', nameOrOrderCode)
    }
    if (page != undefined) {
      params = params.append('page', page)
    }
    if (size != undefined) {
      params = params.append('size', size)
    }
    return this.httpClient.get<IOrderResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(id: string){
    return this.httpClient.get<IOrderDetailResponse>(this.url + '/'+ id).pipe(
      map(res => res.metaData)
    );
  }

  create(data: Order){
    return this.httpClient.post<IOrderDetailResponse>(this.url, data).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<Order>){
    return this.httpClient.patch<IOrderDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, data: Order){
    return this.httpClient.put<IOrderDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  print(id: string){
    return this.httpClient.post(this.url + '/' + id + '/print', null);
  }
}
