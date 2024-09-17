import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { BillInfoComponent } from './bill-info/bill-info.component';
import { Customer } from '../../../shared/interface/order.interface';
import { OrderService } from '../../../shared/service/api/order.service';
import { ReactiveFormsModule } from '@angular/forms';

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
export class OrderEditComponent {
  constructor(
    private orderService: OrderService
  ) { }
  handleCustomer(customer: Customer){
    console.log(customer);
  }
}
