import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PurchaseOrderStatus } from '../../../constant/order.constant';

@Component({
  selector: 'app-status-color',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './status-color.component.html',
  styleUrl: './status-color.component.scss'
})
export class StatusColorComponent {
  @Input() status: PurchaseOrderStatus | string = '';

  get statusClass() {
    switch (this.status) {
      case PurchaseOrderStatus.CREATED: return 'status-created';
      case PurchaseOrderStatus.CONFIRMED: return 'status-confirmed';
      case PurchaseOrderStatus.COMPLETED: return 'status-completed';
      case PurchaseOrderStatus.CANCELED: return 'status-canceled';
      default: return '';
    }
  }
}
