import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PurchaseOrderItem, TPurchaseOrder } from '../../../shared/interface/purchase-order.interface';
import { BehaviorSubject, map, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';

import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/module/material';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';
import { PurchaseOrderService } from '../../../shared/service/api/purchase-order.service';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [
    CommonModule,

    CurrencyCustomPipe,

    MaterialModule
  ],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss'
})
export class PurchaseOrderDetailComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly purchaseOrderService: PurchaseOrderService = inject(PurchaseOrderService);
  purchaseOrder?: TPurchaseOrder;
  displayedColumns = ['name', 'quantity', 'price', 'total'];

  breakpointDetection$ = this.breakpointDetectionService.detection$();

  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {
    const purchaseOrderDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.purchaseOrderService.getDetail(id))
    );
    this.subscription.add(
      purchaseOrderDetail$.subscribe({
        next: res => {
          this.purchaseOrder = res;
          console.log(this.purchaseOrder);
          
        },
        error: error => {
          this.goBackOrderList();
        }
      })
    )
  }

  goBackOrderList() {
    this.router.navigate(['/purchase-order']);
  }

  onPrintEvent() {

  }

  onEditEvent() {
    this.router.navigate(['/purchase-order-edit'], {
      queryParams: {
        _id: this.purchaseOrder?._id
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
