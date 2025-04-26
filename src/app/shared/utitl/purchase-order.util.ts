import { GroupedOrderItems } from "../interface/grouped-order-items.interface";
import { PurchaseOrderItem } from "../interface/purchase-order.interface";

export class PurchaseOrderUtil {
  static groupBySupplier(orderItems: PurchaseOrderItem[]): GroupedOrderItems[] {
    const grouped = orderItems.reduce((acc, item) => {
      const supplierName = item.product.supplierLocationName; // Assuming `supplierName` exists in product
      if (!acc[supplierName]) {
        acc[supplierName] = { productSupplierName: supplierName, orderItems: [], totalPrice: 0 };
      }
      acc[supplierName].orderItems.push(item);
      acc[supplierName].totalPrice += item.itemTotal;
      return acc;
    }, {} as Record<string, GroupedOrderItems>);

    return Object.values(grouped);
  }
}