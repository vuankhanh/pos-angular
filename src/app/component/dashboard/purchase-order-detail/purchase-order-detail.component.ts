import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PurchaseOrderItem, TPurchaseOrder } from '../../../shared/interface/purchase-order.interface';
import { BehaviorSubject, lastValueFrom, map, Observable, Subscription, switchMap, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';

import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/module/material';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';
import { PurchaseOrderService } from '../../../shared/service/api/purchase-order.service';
import { GroupedOrderItems } from '../../../shared/interface/grouped-order-items.interface';
import { PurchaseOrderUtil } from '../../../shared/utitl/purchase-order.util';
import { MatCard } from '@angular/material/card';

import { Html2canvasService } from '../../../shared/service/html2canvas.service';
import { StatusColorComponent } from '../../../shared/component/status-color/status-color.component';
import { AsyncDebtBadgeDirective } from '../../../shared/directive/async-debt-badge.directive';
import { LongPressDirective } from '../../../shared/directive/long-press.directive';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [
    CommonModule,

    StatusColorComponent,
    CurrencyCustomPipe,
    AsyncDebtBadgeDirective,

    MaterialModule
  ],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss'
})
export class PurchaseOrderDetailComponent implements OnInit, OnDestroy {
  @ViewChild('matCard', { read: ElementRef }) matCard!: ElementRef<MatCard>;
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly purchaseOrderService: PurchaseOrderService = inject(PurchaseOrderService);
  private readonly html2canvasService = inject(Html2canvasService)
  
  purchaseOrder?: TPurchaseOrder;

  private readonly bPurchaseOrderItems: BehaviorSubject<PurchaseOrderItem[]> = new BehaviorSubject<PurchaseOrderItem[]>([]);
  purchaseOrderItems$: Observable<PurchaseOrderItem[]> = this.bPurchaseOrderItems.asObservable();
  groupedOrderItems$: Observable<GroupedOrderItems[]> = this.purchaseOrderItems$.pipe(
    map((items) => {
      console.log(items);
      const grouped = PurchaseOrderUtil.groupBySupplier(items);
      
      return grouped;
    })
  );

  totalPrice$: Observable<number> = this.purchaseOrderItems$.pipe(
    map((items) => {
      return items.reduce((total, item) => {
        return total + item.itemTotal;
      }, 0);
    })
  );

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
          // Xử lý purchaseOrderDetail
          this.purchaseOrder = res;
          const purchaseOrderItems: PurchaseOrderItem[] = res.purchaseOrderItems.map(item => {
            return new PurchaseOrderItem({
              product: item.product,
              quantity: item.quantity,
              discount: item.discount || 0
            });
          });

          this.bPurchaseOrderItems.next(purchaseOrderItems);
          
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

  onPanelTitleLongTouch(event: Event) {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
  }

  onPanelTitleLongPress(event: Event) {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
  }

  onPanelTitleClick(event: Event) {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
  }

  async onDownloadEvent() {
    const status = this.purchaseOrder!.status;
    try {
      const groupedOrderItems = await lastValueFrom(this.groupedOrderItems$.pipe(take(1)));
      console.log(groupedOrderItems);
      const totalAmount = await lastValueFrom(this.totalPrice$.pipe(take(1)));

      console.log(totalAmount);
      
      const image = await this.html2canvasService.captureTableFromArray(status, totalAmount, groupedOrderItems, 800, 600)
      const link = document.createElement('a');
      link.href = image;
      link.download = 'grouped-order-items.png';
      link.click();
    } catch (error) {
      console.error('Error capturing table:', error);
      
    }
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
