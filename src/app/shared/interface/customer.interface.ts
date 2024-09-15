import { CustomerLevel } from "../../constant/customer.constant";
import { IMongodbDocument } from "./mongo.interface";
import { IPagination } from "./pagination.interface"
import { ISuccess } from "./success.interface"

export interface ICustomer {
  name: string;
  phoneNumber: string;
  address: string;
  email?: string;
  dob?: string;
  company?: string;
  note?: string;
  level?: ICustomerLevel;
}

export type ICustomerLevel = `${CustomerLevel}`;

export type TCustomerModel = ICustomer & IMongodbDocument;

export interface ICustomerResponse extends ISuccess {
  metaData: {
    data: Array<TCustomerModel>,
    paging: IPagination
  }
}

export interface ICustomerDetailRespone extends ISuccess {
  metaData: TCustomerModel 
}