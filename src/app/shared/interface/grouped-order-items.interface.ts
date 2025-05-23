import { PurchaseOrderItem } from "./purchase-order.interface";

export interface GroupedOrderItems {
  productSupplierName: string;
  productSupplierId: string;
  orderItems: PurchaseOrderItem[];
  totalPrice: number;
}