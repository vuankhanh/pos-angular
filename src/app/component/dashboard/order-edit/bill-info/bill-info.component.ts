import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../shared/module/material';
import { TProductModel } from '../../../../shared/interface/product.interface';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, merge, Observable, startWith, Subscription, switchMap, tap } from 'rxjs';
import { OrderItem } from '../../../../shared/interface/order.interface';
import { ProductService } from '../../../../shared/service/api/product.service';
import { SetBaseUrlPipe } from '../../../../shared/pipe/set-base-url.pipe';
import { MatTable } from '@angular/material/table';
import { CurrencyCustomPipe } from '../../../../shared/pipe/currency-custom.pipe';
import { NumberInputComponent } from '../../../../shared/component/number-input/number-input.component';
import { BillInfoUtil } from '../../../../shared/utitl/bill-info.util';
import { numberValidator } from '../../../../shared/utitl/form-validator.util';
import { MatDialog } from '@angular/material/dialog';
import { FeeDiscountComponent } from '../../../../shared/component/dialog/fee-discount/fee-discount.component';

@Component({
  selector: 'order-bill-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NumberInputComponent,

    MaterialModule,

    SetBaseUrlPipe,
    CurrencyCustomPipe
  ],
  providers: [
    SetBaseUrlPipe,
  ],
  templateUrl: './bill-info.component.html',
  styleUrl: './bill-info.component.scss'
})
export class BillInfoComponent implements OnInit, OnDestroy {
  @ViewChild(MatTable) table?: MatTable<any>

  nameOrProductCodeCtl: FormControl = new FormControl();
  filteredOptions$!: Observable<TProductModel[]>;

  //Table
  orderItems$: BehaviorSubject<OrderItem[]> = new BehaviorSubject<OrderItem[]>([]);
  displayedColumns = ['thumbnail', 'name', 'quantity', 'price', 'total', 'actions'];

  orderNote: string = '';

  //Footer
  footerTotalForm: FormGroup = this.formBuilder.group({
    deliveryFee: [0, [Validators.min(0), numberValidator()]],
    discount: [0, [Validators.min(0), numberValidator()]],
  });

  subTotal: number = 0;
  totalPrice: number = 0;

  subscription: Subscription = new Subscription();
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.filteredOptions$ = this.nameOrProductCodeCtl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.getProduct())
    );

    const footerTotalForm$ = this.footerTotalForm.valueChanges.pipe(
      startWith(this.footerTotalForm.value)
    );

    const combineLastest$ = combineLatest([this.orderItems$, footerTotalForm$]);
    combineLastest$.subscribe(([orderItems, footerTotalValue]) => {
      if(orderItems.length) {
        const deliveryFee = footerTotalValue.deliveryFee;
        const discount = footerTotalValue.discount;
        this.subTotal = BillInfoUtil.calculateSubTotal(orderItems);
        this.totalPrice = BillInfoUtil.calculateFooterTotal(this.subTotal, deliveryFee, discount);
      }
    });
  }

  getProduct() {
    return this.productService.getAll(this.nameOrProductCodeCtl.value as string).pipe(
      map((data) => data.data)
    )
  }

  onChooseProductEvent(product: TProductModel) {
    const orderItem = new OrderItem(product);
    const orderItems = this.orderItems$.value;
    orderItems.push(orderItem);
    this.orderItems$.next(orderItems);
    this.table?.renderRows()
  }

  quantityChange(value: number, orderItem: OrderItem) {
    orderItem.updateQuantity = value;
    const orderItems = this.orderItems$.value;
    this.orderItems$.next(orderItems);
    this.table?.renderRows();
  }

  removeItemQuantity(index: number) {
    const orderItems = this.orderItems$.value;
    orderItems.splice(index, 1);
    this.orderItems$.next(orderItems);
    this.table?.renderRows();
  }

  openDialog(label: string, field: string, suffix: 'percentage' | 'currency'): void {
    const dialogRef = this.dialog.open(FeeDiscountComponent, {
      width: '250px',
      data: {
        label: label,
        value: this.footerTotalForm.controls[field].value,
        suffix
      }
    });
    this.subscription.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.footerTotalForm.controls[field].setValue(result);
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
