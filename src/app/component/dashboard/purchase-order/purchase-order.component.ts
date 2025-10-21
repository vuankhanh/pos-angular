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
import { StatusColorComponent } from '../../../shared/component/status-color/status-color.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [
    CommonModule,

    StatusColorComponent,
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
  displayedColumns = ['status', 'createdAt', 'code', 'totalPrice', 'action'];
  breakpointDetection$ = this.breakpointDetectionService.detection$();
  pagination: IPagination = paginationConstant;
  pageSizeOptions: number[] = [10, 25, 100];

  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.getAll('', this.pagination.page, this.pagination.size);
  }

  getAll(nameSearch: string, page: number, size: number) {
    this.subscription.add(this.purchaseOrderService.getAll(nameSearch, page, size).subscribe({
      next: (res) => {
        this.purchaseOrders = res.data;
        this.pagination = res.paging;
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

  handlePageEvent(event: PageEvent) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.size = event.pageSize;

    this.getAll('', this.pagination.page, this.pagination.size);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}