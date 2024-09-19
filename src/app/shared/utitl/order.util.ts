import { IBill, IBillSubInfo } from "../interface/bill.interface";
import { Customer, OrderItem, TOrderDetailModel } from "../interface/order.interface";
export class OrderUtil{
  static bodyRequestUpdate(order: TOrderDetailModel, billInfo?: IBill, subBillInfo?: IBillSubInfo, customer?: Customer) {
    let change = {} as Partial<TOrderDetailModel>;
    if(billInfo){
      if(!OrderUtil.compareTwoOrderItems(order.orderItems, billInfo.orderItems)){
        change.orderItems = billInfo.orderItems;
      }
  
      if (order.deliveryFee !== billInfo.deliveryFee) {
        change.deliveryFee = billInfo.deliveryFee;
      }
  
      if (order.discount !== billInfo.discount) {
        change.discount = billInfo.discount;
      }
    }

    if(subBillInfo){
      if (order.status !== subBillInfo.orderStatus) {
        change.status = subBillInfo.orderStatus;
      }
  
      if (order.note !== subBillInfo.note) {
        change.note = subBillInfo.note;
      }
  
      if (order.paymentMethod !== subBillInfo.paymentMethod) {
        change.paymentMethod = subBillInfo.paymentMethod;
      }
    }


    if(customer){
      if (order.customerId !== customer._id) {
        change.customerId = customer._id;
        change.customerName = customer.name;
        change.customerPhoneNumber = customer.phoneNumber;
        change.customerAddress = customer.address;
      }
  
      if (order.customerDeliveryAddress !== customer.deliveryAddress) {
        change.customerDeliveryAddress = customer.deliveryAddress;
      }
    }


    return change;
  }

  static compareTwoOrderItems(orderDetails1: Array<OrderItem>, orderDetails2: Array<OrderItem>): boolean {
    if (orderDetails1.length !== orderDetails2.length) {
      return false;
    }

    for (let i = 0; i < orderDetails1.length; i++) {
      const orderDetail1 = orderDetails1[i];
      const orderDetail2 = orderDetails2[i];

      if (orderDetail1.productCode !== orderDetail2.productCode) {
        return false;
      }

      if (orderDetail1.quantity !== orderDetail2.quantity) {
        return false;
      }
    }

    return true;
  }
}

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