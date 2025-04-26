import { of } from "rxjs";

export enum OrderStatus {
  PENDING = 'Chờ xác nhận',
  CONFIRMED = 'Đã xác nhận',
  SHIPPING = 'Đang giao',
  COMPLETED = 'Hoàn thành',
  CANCELED = 'Đã hủy',
}

export enum PurchaseOrderStatus {
  CREATED = 'Đã tạo',
  CONFIRMED = 'Đã xác nhận',
  COMPLETED = 'Hoàn thành',
  CANCELED = 'Đã hủy',
}

export const purchaseOrderStatus$ = of(Object.values(PurchaseOrderStatus));