import { OrderItem } from "../interface/order.interface";

export class BillInfoUtil{
  static calculateSubTotal(orderItems: OrderItem[]): number{
    return orderItems.reduce((acc, cur) => acc + cur.total, 0);
  }
  static calculateFooterTotal(
    subTotal: number,
    deliveryFee: number,
    discount: number
  ): number{
    const amoutAfterDiscount = subTotal * discount / 100;
    let total = subTotal;
    total += deliveryFee;
    total -= amoutAfterDiscount;

    return total;
  }
}