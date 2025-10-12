import { IBankPayment } from "./bank-payment.interface";
import { PurchaseOrderItem } from "./purchase-order.interface";

export interface GroupedOrderItems {
  productSupplierName: string;
  productSupplierId: string;
  bankTransfer?: IBankPayment;
  orderItems: PurchaseOrderItem[];
  totalPrice: number;
}