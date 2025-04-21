import { IMongodbDocument } from "../../../../../shared/interface/mongo.interface";
import { IPagination } from "../../../../../shared/interface/pagination.interface";
import { ISuccess } from "../../../../../shared/interface/success.interface";
import { IDistrict, IProvince, IWard } from "../../../../../shared/interface/vn-public-apis.interface";

export interface ISupplierLocation {
  name: string; // Name of the supplier
  address: {
    province: IProvince;
    district: IDistrict;
    ward: IWard;
    street: string;
  };
  telephone: string; // Contact phone number
  email?: string; // Contact email
  position?: {
    lat: string | number; // Latitude for geolocation
    lng: string | number; // Longitude for geolocation
  },
  url?: string; // Website URL (optional)
  taxID?: string; // Tax identification number (optional)
  contactPoint?: {
    contactType: string; // Type of contact (e.g., Customer Support)
    name: string; // Name of the contact person
    telephone: string; // Contact phone number
    email: string; // Contact email
  };
  logo?: string; // URL to the supplierLocation's logo (optional)
  sameAs?: string[]; // URLs to social media or related profiles (optional)
}

export type TSupplierLocationModel = ISupplierLocation & IMongodbDocument;

export interface ISupplierLocationResponse extends ISuccess {
  metaData: {
    data: Array<TSupplierLocationModel>,
    paging: IPagination
  }
}

export interface ISupplierLocationDetailResponse extends ISuccess {
  metaData: TSupplierLocationModel
}
