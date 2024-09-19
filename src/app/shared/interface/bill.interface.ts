import { OrderItem, TOrderStatus } from "./order.interface";
import { TPaymentMethod } from "./payment.interface";

export interface IBill {
  orderItems: OrderItem[];
  subTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface IBillSubInfo {
  orderStatus: TOrderStatus;
  note: string;
  paymentMethod: TPaymentMethod;
}

export interface IFooterTotal {
  subTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}