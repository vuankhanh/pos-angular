import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { PurchaseOrderItem, TPurchaseOrder } from '../../../shared/interface/purchase-order.interface';
import { Router } from '@angular/router';
import { IPagination } from '../../../shared/interface/pagination.interface';
import { paginationConstant } from '../../../constant/pagination.constant';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { Subscription } from 'rxjs';
import { PurchaseOrderService } from '../../../shared/service/api/purchase-order.service';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [
    CommonModule,

    CurrencyCustomPipe,

    MaterialModule
  ],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss'
})
export class PurchaseOrderComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly breakpointDetectionService = inject(BreakpointDetectionService);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  purchaseOrders: TPurchaseOrder[] = [];
  displayedColumns = ['code', 'totalPrice', 'createdAt', 'action'];
  paging: IPagination = paginationConstant;
  breakpointDetection$ = this.breakpointDetectionService.detection$();

  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.getAll('', this.paging.page, this.paging.size);
  }

  getAll(nameSearch: string, page: number, size: number){
    this.subscription.add(this.purchaseOrderService.getAll(nameSearch, page, size).subscribe({
      next: (res) => {
        this.purchaseOrders = res.data;
        
        console.log(this.purchaseOrders);
      }
    }))
  }

  onCreateEvent() {
    this.router.navigate(['purchase-order-edit']);
  }

  onViewEvent(purchaseOrder: TPurchaseOrder) {
    this.router.navigate(['purchase-order', purchaseOrder._id]);
  }

  onEditEvent(purchaseOrder: TPurchaseOrder) {
    this.router.navigate(['purchase-order-edit'], {
      queryParams: {
        _id: purchaseOrder._id
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}