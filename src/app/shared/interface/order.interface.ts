import { OrderStatus } from "../../constant/order.constant";
import { IBill, IBillSubInfo } from "./bill.interface";
import { ICustomerLevel, TCustomerModel } from "./customer.interface";
import { IMongodbDocument } from "./mongo.interface";
import { IPagination } from "./pagination.interface";
import { TPaymentMethod } from "./payment.interface";
import { TProductModel } from "./product.interface";
import { ISuccess } from "./success.interface";

export type TOrderStatus = `${OrderStatus}`;

export interface IBaseOrder {
  status: TOrderStatus;
  paymentMethod: TPaymentMethod;
  note: string;
}

export interface IOrderItem {
  productThumbnail: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

export type TOrderModel = {
  productName: string;
  productThumbnail: string;
  productQuantity: number;
  total: number;
} & IBaseOrder & IMongodbDocument;

export type TOrderDetailModel = {
  orderCode: string;
  orderItems: Array<OrderItem>;
  customerId?: string;
  customerDetail?: Customer;
  customerPhoneNumber?: string;
  customerName?: string;
  customerAddress?: string;
  customerDeliveryAddress?: string;
  subTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}& IBaseOrder & IMongodbDocument
export type TOrderItem = IOrderItem & IMongodbDocument;

export class Customer implements TCustomerModel {
  _id: string;
  name: string;
  phoneNumber: string;
  address: string;
  deliveryAddress: string;
  email?: string;
  dob?: string;
  company?: string;
  note?: string;
  level?: ICustomerLevel;
  createdAt: string;
  updatedAt: string;

  constructor(data: TCustomerModel) {
    this._id = data._id;
    this.name = data.name;
    this.phoneNumber = data.phoneNumber;
    this.address = data.address;
    this.email = data.email;
    this.dob = data.dob;
    this.company = data.company;
    this.note = data.note;
    this.level = data.level;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.deliveryAddress = data.address;
  }

  set updateDeliveryAddress(deliveryAddress: string) {
    this.deliveryAddress = deliveryAddress;
  }
}

export class OrderItem implements IOrderItem {
  productCode: string;
  productName: string;
  productThumbnail: string;
  quantity: number = 1;
  unit: string;
  price: number;
  total: number;

  constructor(data: TProductModel) {
    this.productCode = data.code;
    this.productName = data.name;
    this.productThumbnail = data.albumDetail.thumbnail;
    this.unit = data.unit;
    this.price = data.price;
    this.total = this.price * this.quantity;
  }
}

export class Order implements IBaseOrder {
  status: TOrderStatus;
  orderItems: Array<OrderItem>;
  paymentMethod: TPaymentMethod;
  deliveryFee: number;
  discount: number;
  customerId?: string;
  customerDeliveryAddress?: string;
  note: string;

  constructor(billInfo: IBill, billSubInfo: IBillSubInfo, customer?: Customer) {
    this.status = billSubInfo.orderStatus;
    this.orderItems = billInfo.orderItems;
    this.paymentMethod = billSubInfo.paymentMethod;
    this.deliveryFee = billInfo.deliveryFee;
    this.discount = billInfo.discount;
    this.customerId = customer?._id;
    this.customerDeliveryAddress = customer?.deliveryAddress;
    this.note = billSubInfo.note;
  }
}

export interface IOrderResponse extends ISuccess {
  metaData: {
    data: Array<TOrderModel>,
    paging: IPagination
  }
}

export interface IOrderDetailResponse {
  metaData: TOrderDetailModel
}