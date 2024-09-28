import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ICustomer, ICustomerDetailRespone, ICustomerResponse } from '../../interface/customer.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private url = environment.backendApi + '/customer';

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
    return this.httpClient.get<ICustomerResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(id: string){
    return this.httpClient.get<ICustomerDetailRespone>(this.url + '/'+ id).pipe(
      map(res => res.metaData)
    );
  }

  create(data: ICustomer){
    return this.httpClient.post<ICustomerDetailRespone>(this.url, data).pipe(
      map(res => res.metaData)
    );
  }

  importFile(file: Blob){
    const formData = new FormData();
    formData.append('csv', file);
    return this.httpClient.post<ICustomerDetailRespone>(this.url + '/upload-csv', formData).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<ICustomer>){
    return this.httpClient.patch<ICustomerDetailRespone>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, data: ICustomer){
    return this.httpClient.put<ICustomerDetailRespone>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  remove(id: string){
    return this.httpClient.delete<ICustomerDetailRespone>(this.url + '/' + id).pipe(
      map(res => res.metaData)
    );
  }
}
