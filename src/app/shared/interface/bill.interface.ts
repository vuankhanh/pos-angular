import { IOrderItem } from "./order.interface";

export interface IBill {
  orderItems: IOrderItem[];
  subTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface IFooterTotal {
  subTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}
