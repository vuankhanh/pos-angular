import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { TOrderDetailModel } from '../../../shared/interface/order.interface';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { NumberInputComponent } from '../../../shared/component/number-input/number-input.component';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';
import { BehaviorSubject, map, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../shared/service/api/order.service';
import { OrderStatus } from '../../../constant/order.constant';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,

    MaterialModule,

    SetBaseUrlPipe,
    CurrencyCustomPipe
  ],
  providers: [
    CurrencyCustomPipe
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order?: TOrderDetailModel;
  displayedColumns = ['thumbnail', 'name', 'quantity', 'price', 'total'];

  isPrintButtonDisabled$ = new BehaviorSubject<boolean>(false);

  breakpointDetection$ = this.breakpointDetectionService.detection$();

  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private readonly breakpointDetectionService: BreakpointDetectionService,
    private orderService: OrderService
  ) { }
  
  ngOnInit(): void {
    const customerDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.orderService.getDetail(id))
    );

    this.subscription.add(
      customerDetail$.subscribe({
        next: res => {
          this.order = res;
          const isDisable = !this.validStatus(this.order);
          this.isPrintButtonDisabled$.next(isDisable); 
        },
        error: error => {
          this.goBackOrderList();
        }
      })
    )
  }

  goBackOrderList() {
    this.router.navigate(['/order']);
  }

  onPrintEvent() {
    if (this.order) {
      const validStatus = this.validStatus(this.order);
      if(validStatus){
        this.subscription.add(
          this.orderService.print(this.order?._id).subscribe({
            next: res => {
              console.log(res);
            },
            error: error => {
              console.log(error);
            }
          })
        )
      }
    }
  }

  private validStatus(order: TOrderDetailModel): boolean {
    const validStatus = [OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.COMPLETED].includes(order.status as OrderStatus)
    return validStatus;
  }

  onEditEvent(){
    this.router.navigate(['/order-edit'], {
      queryParams: {
        _id: this.order?._id
      }
    });
  }

  ngOnDestroy(): void {
    // unsubscribe
  }
}
