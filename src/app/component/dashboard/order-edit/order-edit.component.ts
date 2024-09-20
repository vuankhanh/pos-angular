import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { BillInfoComponent } from './bill-info/bill-info.component';
import { Customer, Order, TOrderDetailModel } from '../../../shared/interface/order.interface';
import { OrderService } from '../../../shared/service/api/order.service';
import { ReactiveFormsModule } from '@angular/forms';
import { IBill, IBillSubInfo } from '../../../shared/interface/bill.interface';
import { BehaviorSubject, combineLatest, filter, map, of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderUtil } from '../../../shared/utitl/order.util';
import { ProductService } from '../../../shared/service/api/product.service';
import { TProductModel } from '../../../shared/interface/product.interface';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    BillInfoComponent,
    CustomerInfoComponent,

    MaterialModule
  ],
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.scss'
})
export class OrderEditComponent implements OnInit, OnDestroy {
  billInfo?: IBill;
  subBillInfo?: IBillSubInfo;
  customer?: Customer;

  propertyChange$ = new BehaviorSubject<null>(null);
  updateButtonDisabled$ = this.propertyChange$.pipe(
    filter(_ => !!this.order),
    map(_ => {
      return {
        order: this.order!,
        billInfo: this.billInfo,
        subBillInfo: this.subBillInfo!,
        customer: this.customer
      }
    }),
    map(res => {
      const { order, billInfo, subBillInfo, customer } = res;
      const change = OrderUtil.bodyRequestUpdate(order, billInfo, subBillInfo, customer);

      return Object.keys(change).length <= 0;
    }),
  );

  order?: TOrderDetailModel;
  product?: TProductModel;

  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.activatedRoute.queryParamMap.pipe(
      switchMap(params => {
        const id: string = params.get('_id') as string;
        const productId: string = params.get('productId') as string;
  
        const orderDetail$ = id ? this.orderService.getDetail(id) : of(null);
        const productDetail$ = productId ? this.productService.getDetail(productId) : of(null);
  
        return combineLatest([orderDetail$, productDetail$]);
      }),
      filter(([orderDetail, productDetail]) => !!orderDetail || !!productDetail)
    ).subscribe({
      next: ([orderDetail, productDetail]) => {
        if (orderDetail) {
          // Xử lý orderDetail
          this.order = orderDetail;
        }
        if (productDetail) {
          // Xử lý productDetail
          this.product = productDetail;
        }
      },
      error: error => {
        this.backToOrderDetail();
      }
    });
  }

  handleBillInfo(billInfo: IBill) {
    this.billInfo = billInfo;
    this.propertyChange$.next(null);
  }

  handleSubBillInfo(subBillInfo: IBillSubInfo) {
    this.subBillInfo = subBillInfo;
    this.propertyChange$.next(null);
  }

  handleCustomer(customer: Customer) {
    this.customer = customer;
    this.propertyChange$.next(null);
  }

  update() {
    if(this.order){
      //So sánh dữ liệu dữa order và billInfo + subBillInfo + customer
      const change = OrderUtil.bodyRequestUpdate(this.order, this.billInfo, this.subBillInfo, this.customer);

      this.subscription.add(
        this.orderService.update(this.order._id, change).subscribe(res => {
          if(res){
            this.order = res;
            this.router.navigate(['/order', this.order._id]);
          }
        })
      )
    }
  }

  create() {
    if(this.billInfo && this.subBillInfo){
      const order = new Order(this.billInfo, this.subBillInfo, this.customer);
      this.subscription.add(
        this.orderService.create(order).subscribe(res => {
          if(res){
            this.router.navigate(['/order', res._id]);
          }
        })
      )
    }
  }

  backToOrderDetail() {
    const commands = this.order?._id ? ['/order', this.order?._id] : ['/order'];
    this.router.navigate(commands);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
