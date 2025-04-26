import { PurchaseOrderItem } from "./purchase-order.interface";

export interface GroupedOrderItems {
  productSupplierName: string;
  orderItems: PurchaseOrderItem[];
  totalPrice: number;
}