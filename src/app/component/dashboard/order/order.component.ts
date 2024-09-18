import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TOrderDetailModel, TOrderModel } from '../../../shared/interface/order.interface';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../shared/service/api/order.service';
import { IPagination } from '../../../shared/interface/pagination.interface';
import { paginationConstant } from '../../../constant/pagination.constant';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    
    MaterialModule,

    SetBaseUrlPipe,
    CurrencyCustomPipe
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy {
  orders: TOrderModel[] = [];

  displayedColumns = ['thumbnail', 'name', 'quantity', 'action'];
  paging: IPagination = paginationConstant;
  breakpointDetection$ = this.breakpointDetectionService.detection$();

  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private orderService: OrderService,
    private breakpointDetectionService: BreakpointDetectionService
  ) {

  }

  ngOnInit(): void {
    this.getAll('', this.paging.page, this.paging.size);
  }

  getAll(nameSearch: string, page: number, size: number){
    this.subscription.add(this.orderService.getAll(nameSearch, page, size).subscribe({
      next: (res) => {
        this.orders = res.data;
        console.log(this.orders);
        
      }
    }))
  }

  onCreateEvent() {
    this.router.navigate(['order-edit']);
  }

  onViewEvent(order: TOrderModel) {
    this.router.navigate(['order', order._id]);
  }

  onEditEvent(order: TOrderModel) {
    this.router.navigate(['order-edit'], {
      queryParams: {
        _id: order._id
      }
    });
  }

  ngOnDestroy(): void {
    
  }
}
