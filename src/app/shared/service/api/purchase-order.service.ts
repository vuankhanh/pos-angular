import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IPurchaseOrderDetailResponse, IPurchaseOrderResponse, PurchaseOrderItem, TPurchaseOrder } from '../../interface/purchase-order.interface';
import { PurchaseOrderStatus } from '../../../constant/order.constant';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private readonly url: string = environment.backendApi + '/purchase-order';

  private readonly httpClient: HttpClient = inject(HttpClient);

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
    return this.httpClient.get<IPurchaseOrderResponse>(this.url, { params }).pipe(
      map(res => res.metaData)
    );
  }

  getDetail(id: string): Observable<TPurchaseOrder> {
    return this.httpClient.get<IPurchaseOrderDetailResponse>(this.url + '/' + id).pipe(
      map(res => res.metaData),
      map(res => {
        res.purchaseOrderItems = res.purchaseOrderItems.map(item => {
          const purchaseOrderItem = new PurchaseOrderItem(item);
          return purchaseOrderItem;
        });
        return { ...res };
      })
    );
  }

  create(status: `${PurchaseOrderStatus}`, purchaseOrderItems: PurchaseOrderItem[]) {
    const data = {
      status,
      purchaseOrderItems
    }
    return this.httpClient.post<IPurchaseOrderDetailResponse>(this.url, data).pipe(
      map(res => res.metaData)
    );
  }

  update(id: string, data: Partial<{status: `${PurchaseOrderStatus}`, purchaseOrderItems: PurchaseOrderItem[] }>) {
    return this.httpClient.patch<IPurchaseOrderDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  replace(id: string, status: `${PurchaseOrderStatus}`, purchaseOrderItems: PurchaseOrderItem[]) {
    const data = {
      status,
      purchaseOrderItems
    }
    return this.httpClient.put<IPurchaseOrderDetailResponse>(this.url + '/' + id, data).pipe(
      map(res => res.metaData)
    );
  }

  remove(id: string) {
    return this.httpClient.delete<IPurchaseOrderDetailResponse>(this.url + '/' + id).pipe(
      map(res => res.metaData)
    );
  }
}

export function groupPurchaseOrderItemsByProductName(
  purchaseOrderItems: PurchaseOrderItem[]
): { group: string; groupItem: PurchaseOrderItem[]; totalPrice: number }[] {
  const grouped = purchaseOrderItems.reduce((acc, item) => {
    const productName = item.product.name; // Assuming product has a 'name' property
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push(item);
    return acc;
  }, {} as Record<string, PurchaseOrderItem[]>);

  return Object.keys(grouped).map((group) => {
    const groupItems = grouped[group];
    const totalPrice = groupItems.reduce((sum, item) => sum + item.itemTotal, 0);
    return {
      group,
      groupItem: groupItems,
      totalPrice,
    };
  });
}