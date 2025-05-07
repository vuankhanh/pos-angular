import { SupplierProductUnit } from "../../../../../constant/product.constant";
import { IMongodbDocument } from "../../../../../shared/interface/mongo.interface";
import { IPagination } from "../../../../../shared/interface/pagination.interface";
import { ISuccess } from "../../../../../shared/interface/success.interface";
import { ISupplierDebt } from "./supplier-location.interface";

export interface ISupplierProduct {
  name: string;
  price: number;
  unit: `${SupplierProductUnit}`;
  description?: string;
  supplierLocationId: string;
  supplierLocationName: string;
  supplierLocationDebt: ISupplierDebt;
}

export type TSupplierProductModel = ISupplierProduct & IMongodbDocument;

export interface ISupplierProductResponse extends ISuccess {
  metaData: {
    data: Array<TSupplierProductModel>,
    paging: IPagination
  }
}

export interface ISupplierProductDetailResponse extends ISuccess {
  metaData: TSupplierProductModel
}