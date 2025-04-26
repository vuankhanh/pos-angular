import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { PurchaseOrderItem } from '../interface/purchase-order.interface';
import { GroupedOrderItems } from '../interface/grouped-order-items.interface';
import { PurchaseOrderStatus } from '../../constant/order.constant';

@Injectable({
  providedIn: 'root'
})
export class Html2canvasService {

  // Method to render a table from an array and capture it as an image
  captureTableFromArray(status: `${PurchaseOrderStatus}`, totalAmount: number, data: GroupedOrderItems[], width: number = 800, height: number = 600): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate table HTML dynamically
      const tableRows = data.map(group => {
        const supplierHeader = `
          <tr style="background: #f5f5f5;">
            <td colspan="5" style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">${group.productSupplierName}</span>
                <span style="font-weight: bold;">Tổng tiền: ${group.totalPrice.toLocaleString()} đ</span>
              </div>
            </td>
          </tr>
        `;

        const orderItems = group.orderItems.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.product.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.product.price.toLocaleString()} đ</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.product.unit}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.itemTotal.toLocaleString()} đ</td>
          </tr>
        `).join('');

        return supplierHeader + orderItems;
      }).join('');

      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; width: 100%; height: 100%; padding: 20px; box-sizing: border-box;">
          <h1 style="text-align: center;">Danh sách sản phẩm</h1>
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="margin: 5px 0; font-size: 16px;">Trạng thái: <strong>${status}</strong></p>
            <p style="margin: 5px 0; font-size: 16px;">Tổng tiền: <strong>${totalAmount.toLocaleString()} đ</strong></p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;">Tên sản phẩm</th>
                <th style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;">Đơn giá</th>
                <th style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;">Số lượng</th>
                <th style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;">Đơn vị</th>
                <th style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;">Tổng</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;

      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px'; // Hide it off-screen
      container.style.width = `${width}px`;
      // container.style.height = `${height}px`;
      container.innerHTML = htmlTemplate;

      document.body.appendChild(container);

      // Use html2canvas to capture the container
      html2canvas(container, { width }).then(canvas => {
        // Convert canvas to image
        const image = canvas.toDataURL('image/png');
        document.body.removeChild(container); // Clean up
        resolve(image);
      }).catch(error => {
        document.body.removeChild(container); // Clean up
        reject(error);
      });
    });
  }
}
