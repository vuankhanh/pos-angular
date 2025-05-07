import { PurchaseOrderItem } from "./purchase-order.interface";

export interface GroupedOrderItems {
  productSupplierName: string;
  productSupplierDebt: number;
  orderItems: PurchaseOrderItem[];
  totalPrice: number;
}