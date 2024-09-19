import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { BillInfoComponent } from './bill-info/bill-info.component';
import { Customer, Order, OrderItem, TOrderDetailModel } from '../../../shared/interface/order.interface';
import { OrderService } from '../../../shared/service/api/order.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IBill, IBillSubInfo } from '../../../shared/interface/bill.interface';
import { BehaviorSubject, filter, map, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderUtil } from '../../../shared/utitl/order.util';

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
    filter(_ => !!this.order && (!!this.billInfo || !!this.subBillInfo)),
    map(_ => {
      return {
        order: this.order!,
        billInfo: this.billInfo!,
        subBillInfo: this.subBillInfo!,
        customer: this.customer!
      }
    }),
    map(res => {
      const { order, billInfo, subBillInfo, customer } = res;
      const change = OrderUtil.bodyRequestUpdate(order, billInfo, subBillInfo, customer);
      
      return  Object.keys(change).length <= 0;
    }),
  );

  order?: TOrderDetailModel;

  subscription: Subscription = new Subscription();
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.activatedRoute.queryParamMap.pipe(
      map(params => {
        const id: string = params.get('_id') as string;
        return id;
      }),
      filter(id => !!id),
      switchMap(id => {
        return this.orderService.getDetail(id);
      })
    ).subscribe(order => {
      this.order = order;
    });
  }

  handleBillInfo(billInfo: IBill) {
    this.billInfo = billInfo;
    console.log(this.order?.orderItems);
    console.log(this.billInfo?.orderItems);
    
    
    this.propertyChange$.next(null);
  }
  
  handleSubBillInfo(subBillInfo: IBillSubInfo) {
    this.subBillInfo = subBillInfo;
    this.propertyChange$.next(null);
  }

  handleCustomer(customer: Customer) {
    console.log(customer);
    this.customer = customer;
    this.propertyChange$.next(null);
  }

  save() {
    if(this.billInfo && this.subBillInfo) {
    const api$ = this.order ? this.update(this.order, this.billInfo, this.subBillInfo, this.customer) : this.create(this.billInfo, this.subBillInfo, this.customer);
      this.subscription.add(
        api$.subscribe(data => {
          this.backToOrderDetail();
        })
      )
    }
  }

  private update(order: TOrderDetailModel, billInfo: IBill, subBillInfo: IBillSubInfo, customer?: Customer) {
    //So sánh dữ liệu dữa order và billInfo + subBillInfo + customer
    const change = OrderUtil.bodyRequestUpdate(order, billInfo, subBillInfo, customer);
    return this.orderService.update(order._id, change);
  }

  private create(billInfom: IBill, subBillInfo: IBillSubInfo, customer?: Customer) {
    const order = new Order(billInfom, subBillInfo, customer);
    return this.orderService.create(order);
  }

  backToOrderDetail() {
    this.router.navigate(['/order', this.order?._id]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
