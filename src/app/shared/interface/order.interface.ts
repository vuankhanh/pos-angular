import { OrderStatus } from "../../constant/order.constant";
import { ICustomerLevel, TCustomerModel } from "./customer.interface";
import { IMongodbDocument } from "./mongo.interface";
import { IPagination } from "./pagination.interface";
import { TPaymentMethod } from "./payment.interface";
import { TProductModel } from "./product.interface";
import { ISuccess } from "./success.interface";

export type TOrderStatus = `${OrderStatus}`;

export interface IOrder {
  status: TOrderStatus;
  customerId: string;
  customerDetail: TCustomerModel;
  paymentMethod?: TPaymentMethod;
  deliveryAddress?: string;
  note?: string;
}

export interface IOrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

export type TOrder = IOrder & IMongodbDocument;
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

  set updateDeveryAddress(deliveryAddress: string) {
    this.deliveryAddress = deliveryAddress;
  }
}

export class OrderItem implements IOrderItem {
  thumbnail: string;
  productCode: string;
  productName: string;
  quantity: number = 1;
  unit: string;
  price: number;
  total: number;

  constructor(data: TProductModel) {
    this.thumbnail = data.albumDetail.thumbnail;
    this.productCode = data.code;
    this.productName = data.name;
    this.unit = data.unit;
    this.price = data.price;
    this.total = this.price * this.quantity;
  }

  set updateQuantity(quantity: number) {
    this.quantity = quantity;
    this.total = this.price * this.quantity;
  }
}

export class Order implements IOrder {
  status: TOrderStatus;
  customerId: string;
  customerDetail: TCustomerModel;
  paymentMethod?: TPaymentMethod;
  customerName?: string;
  customerPhoneNumber?: string;
  deliveryAddress?: string;
  note?: string;

  constructor(data: IOrder) {
    this.status = data.status;
    this.customerId = data.customerId;
    this.customerDetail = data.customerDetail;
    this.paymentMethod = data.paymentMethod;
    this.customerName = data.customerDetail.name;
    this.customerPhoneNumber = data.customerDetail.phoneNumber;
    this.deliveryAddress = data.deliveryAddress;
    this.note = data.note;
  }
}

export interface IOrderResponse extends ISuccess {
  metaData: {
    data: Array<TOrder>,
    paging: IPagination
  }
}

export interface IOrderDetailResponse {
  metaData: TOrder
}