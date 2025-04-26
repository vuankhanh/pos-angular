import { ISupplierProduct, TSupplierProductModel } from "../../component/dashboard/supplier/shared/interface/supplier-product.interface";
import { PurchaseOrderStatus } from "../../constant/order.constant";
import { IMongodbDocument } from "./mongo.interface";
import { IPagination } from "./pagination.interface";
import { ISuccess } from "./success.interface";

export interface IPurchaseOrder {
  orderCode: string;
  status: `${PurchaseOrderStatus}`;
  purchaseOrderItems: PurchaseOrderItem[];
  totalPrice: number;
}

interface IPurchaseOrderItem{
  product: TSupplierProductModel;
  quantity: number;
  discount: number;
}

export class PurchaseOrderItem implements IPurchaseOrderItem {
  product: TSupplierProductModel;
  quantity: number;
  discount: number;
  itemTotal: number;

  constructor(purchaseOrderItem: IPurchaseOrderItem) {
    this.product = purchaseOrderItem.product;
    this.quantity = purchaseOrderItem.quantity;
    this.discount = purchaseOrderItem.discount || 0;
    this.itemTotal = this.calculateItemTotal();
  }

  private calculateItemTotal(): number {
    return this.product.price * this.quantity - this.discount;
  }
}

export type TPurchaseOrder = IPurchaseOrder & IMongodbDocument;

export type TPurchaseOrderGroupBySupplier = {
  group: string;
  groupItem: PurchaseOrderItem[];
  totalPrice: number;}

export interface IPurchaseOrderResponse extends ISuccess {
  metaData: {
    data: TPurchaseOrder[];
    paging: IPagination;
  };
}

export interface IPurchaseOrderDetailResponse extends ISuccess {
  metaData: TPurchaseOrder;
}