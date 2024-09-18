import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { BillInfoComponent } from './bill-info/bill-info.component';
import { Customer, Order } from '../../../shared/interface/order.interface';
import { OrderService } from '../../../shared/service/api/order.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IBill, IBillSubInfo } from '../../../shared/interface/bill.interface';
import { Subscription } from 'rxjs';

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
  customer?: Customer

  subscription: Subscription = new Subscription();
  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {

  }

  handleBillInfo(billInfo: IBill) {
    console.log(billInfo);
    this.billInfo = billInfo;
  }

  handleSubBillInfo(subBillInfo: IBillSubInfo) {
    console.log(subBillInfo);
    this.subBillInfo = subBillInfo;
  }

  handleCustomer(customer: Customer) {
    console.log(customer);
    this.customer = customer;
  }

  save() {
    console.log(this.billInfo);
    console.log(this.subBillInfo);
    console.log(this.customer);
    if(this.billInfo && this.subBillInfo) {
      const order = new Order(this.billInfo, this.subBillInfo, this.customer);
      this.subscription.add(
        this.orderService.create(order).subscribe(data => {
          console.log(data);
        })
      )
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
