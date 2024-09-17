import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TCustomerModel } from '../../../../shared/interface/customer.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/module/material';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Observable, Subscription, switchMap } from 'rxjs';
import { CustomerService } from '../../../../shared/service/api/customer.service';
import { Customer } from '../../../../shared/interface/order.interface';
import { MatDialog } from '@angular/material/dialog';
import { CustomerAddressComponent } from '../../../../shared/component/dialog/customer-address/customer-address.component';

@Component({
  selector: 'order-customer-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    CustomerAddressComponent,

    MaterialModule
  ],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.scss'
})
export class CustomerInfoComponent implements OnInit, OnDestroy {
  @Output() emitCustomer = new EventEmitter<Customer>();
  cusNameSearchCtl = new FormControl('');
  orderCustomer?: Customer;

  filteredOptions$!: Observable<TCustomerModel[]>;

  subscrioption: Subscription = new Subscription();
  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {

  }
  ngOnInit(): void {
    this.filteredOptions$ = this.cusNameSearchCtl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.getCustomer())
    );

    this.getCustomerDetail('66e941ac5fd7b0ee8a0fe76b').subscribe((data) => {
      this.orderCustomer = new Customer(data);
      this.emitCustomer.emit(this.orderCustomer);
    })
  }

  private getCustomer() {
    return this.customerService.getAll(this.cusNameSearchCtl.value as string).pipe(
      map((data) => data.data)
    )
  }

  onEditCustomerEvent() {
    this.orderCustomer = undefined;
    this.emitCustomer.emit(this.orderCustomer);
  }

  onChooseCustomerEvent(customer: TCustomerModel) {
    this.cusNameSearchCtl.reset();
    this.subscrioption.add(
      this.getCustomerDetail(customer._id).subscribe((data) => {
        this.orderCustomer = new Customer(data);
        this.emitCustomer.emit(this.orderCustomer);
      })
    )
  }

  private getCustomerDetail(customerId: string) {
    return this.customerService.getDetail(customerId)
  }

  editCustomerDeliveryAddress(deliveryAddress: string) {
    this.dialog.open(CustomerAddressComponent,{
      data: deliveryAddress,
      width: '500px',
    }).afterClosed().subscribe((data) => {
      if (data) {
        this.orderCustomer!.updateDeveryAddress = data;
        this.emitCustomer.emit(this.orderCustomer);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscrioption.unsubscribe();
  }
}

