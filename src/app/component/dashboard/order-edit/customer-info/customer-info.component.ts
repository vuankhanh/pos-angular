import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TCustomerModel } from '../../../../shared/interface/customer.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/module/material';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Observable, Subscription, switchMap } from 'rxjs';
import { CustomerService } from '../../../../shared/service/api/customer.service';
import { Customer, TOrderDetailModel } from '../../../../shared/interface/order.interface';
import { MatDialog } from '@angular/material/dialog';
import { CustomerAddressComponent } from '../../../../shared/component/dialog/customer-address/customer-address.component';
import { PhoneNumberPipe } from '../../../../shared/pipe/phone-number.pipe';

@Component({
  selector: 'order-customer-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    CustomerAddressComponent,

    MaterialModule,

    PhoneNumberPipe
  ],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.scss'
})
export class CustomerInfoComponent implements OnChanges, OnInit, OnDestroy {
  @Input() order?: TOrderDetailModel;
  @Output() emitCustomer = new EventEmitter<Customer>();
  cusNameSearchCtl = new FormControl('');

  filteredOptions$!: Observable<TCustomerModel[]>;
  customer?: Customer;

  subscrioption: Subscription = new Subscription();
  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']) {
      const previousValue = changes['order'].previousValue;
      const currentValue = changes['order'].currentValue;

      if (currentValue && previousValue !== currentValue) {
        const order: TOrderDetailModel = currentValue;
        if (order.customerDetail) {
          this.customer = new Customer(order.customerDetail);
          this.customer.updateDeliveryAddress = order.customerDeliveryAddress!;
        }
      }
    }
  }

  ngOnInit(): void {
    this.filteredOptions$ = this.cusNameSearchCtl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.getCustomer())
    );
  }

  private getCustomer() {
    return this.customerService.getAll(this.cusNameSearchCtl.value as string).pipe(
      map((data) => data.data)
    )
  }

  onEditCustomerEvent() {
    this.customer = undefined;
    this.emitCustomer.emit(this.customer);
  }

  onChooseCustomerEvent(customer: TCustomerModel) {
    this.cusNameSearchCtl.reset();
    this.subscrioption.add(
      this.getCustomerDetail(customer._id).subscribe({
        next: data => {
          this.customer = new Customer(data);
          this.emitCustomer.emit(this.customer);
        },
        error: (error) => { console.log(error) }
      })

    )
  }

  private getCustomerDetail(customerId: string) {
    return this.customerService.getDetail(customerId)
  }

  editCustomerDeliveryAddress(deliveryAddress: string) {
    this.subscrioption.add(
      this.dialog.open(CustomerAddressComponent, {
        data: deliveryAddress,
        width: '500px',
      }).afterClosed().subscribe((data) => {
        if (data) {
          this.customer!.updateDeliveryAddress = data;
          this.emitCustomer.emit(this.customer);
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscrioption.unsubscribe();
  }
}

