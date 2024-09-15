import { IMongodbDocument } from "./mongo.interface";
import { IPagination } from "./pagination.interface";
import { ISuccess } from "./success.interface";

export interface IProduct {
  name: string;
  price: number;
  availability: boolean;
  unit: string;
  description?: string;
  usageInstructions?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
}

export type TProductModel = IProduct & IMongodbDocument;

export interface IProductResponse extends ISuccess {
  metaData: {
    data: Array<TProductModel>,
    paging: IPagination
  }
}

export interface IProductDetailRespone {
  metaData: TProductModel
}
