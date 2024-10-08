import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../shared/module/material';
import { TProductModel } from '../../../../shared/interface/product.interface';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, startWith, Subscription, switchMap } from 'rxjs';
import { OrderItem, TOrderDetailModel } from '../../../../shared/interface/order.interface';
import { ProductService } from '../../../../shared/service/api/product.service';
import { SetBaseUrlPipe } from '../../../../shared/pipe/set-base-url.pipe';
import { MatTable } from '@angular/material/table';
import { CurrencyCustomPipe } from '../../../../shared/pipe/currency-custom.pipe';
import { NumberInputComponent } from '../../../../shared/component/number-input/number-input.component';
import { numberValidator } from '../../../../shared/utitl/form-validator.util';
import { MatDialog } from '@angular/material/dialog';
import { FeeDiscountComponent } from '../../../../shared/component/dialog/fee-discount/fee-discount.component';
import { IBill, IBillSubInfo } from '../../../../shared/interface/bill.interface';
import { OrderStatus } from '../../../../constant/order.constant';
import { PaymentMethod } from '../../../../constant/payment.constant';
import { TPaymentMethod } from '../../../../shared/interface/payment.interface';
import { MatSelectChange } from '@angular/material/select';
import { BreakpointDetectionService } from '../../../../shared/service/breakpoint-detection.service';
import { BillInfoUtil } from '../../../../shared/utitl/order.util';
import { cloneDeep } from 'lodash';

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
export class BillInfoComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild(MatTable) table?: MatTable<any>;

  @Input() order?: TOrderDetailModel;
  @Input() product?: TProductModel;

  @Output() emitBillInfo = new EventEmitter<IBill>();
  @Output() emitBillSubInfo = new EventEmitter<IBillSubInfo>();

  nameOrProductCodeCtl: FormControl = new FormControl();
  filteredOptions$!: Observable<TProductModel[]>;
  breakpointDetection$ = this.breakpointDetectionService.detection$();

  //Table
  orderItems$: BehaviorSubject<OrderItem[]> = new BehaviorSubject<OrderItem[]>([]);
  displayedColumns = ['thumbnail', 'name', 'quantity', 'price', 'total', 'actions'];

  //Footer
  footerTotalForm: FormGroup = this.formBuilder.group({
    deliveryFee: [0, [Validators.min(0), numberValidator()]],
    discount: [0, [Validators.min(0), numberValidator()]],
  });

  subTotal: number = 0;
  totalPrice: number = 0;

  subInfoForm: FormGroup = this.formBuilder.group({
    orderStatus: [OrderStatus.PENDING, Validators.required],
    orderNote: [''],
    paymentMethod: [PaymentMethod.PENDING, Validators.required]
  });

  get orderPaymentMethodControl(): FormControl {
    return this.subInfoForm.get('paymentMethod') as FormControl;
  }

  orderStatuses = Object.values(OrderStatus);
  paymentMethods = Object.values(PaymentMethod);

  subscription: Subscription = new Subscription();
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private productService: ProductService,
    private breakpointDetectionService: BreakpointDetectionService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']) {
      const previousValue = changes['order'].previousValue;
      const currentValue = changes['order'].currentValue;
      if (currentValue && previousValue !== currentValue) {
        const order: TOrderDetailModel = currentValue;

        this.orderItems$.next(cloneDeep(order.orderItems));
        this.footerTotalForm.controls['deliveryFee'].setValue(order.deliveryFee);
        this.footerTotalForm.controls['discount'].setValue(order.discount);

        this.subInfoForm.controls['orderStatus'].setValue(order.status);
        this.subInfoForm.controls['orderNote'].setValue(order.note);
        this.subInfoForm.controls['paymentMethod'].setValue(order.paymentMethod);
      }
    }

    if (changes['product']) {
      const previousValue = changes['product'].previousValue;
      const currentValue = changes['product'].currentValue;
      if (currentValue && previousValue !== currentValue) {
        this.onChooseProductEvent(currentValue);
      }
    }

  }

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
    this.subscription.add(
      combineLastest$.subscribe(([orderItems, footerTotalValue]) => {
        if (orderItems.length) {
          const deliveryFee = footerTotalValue.deliveryFee;
          const discount = footerTotalValue.discount;
          this.subTotal = BillInfoUtil.calculateSubTotal(orderItems);
          this.totalPrice = BillInfoUtil.calculateFooterTotal(this.subTotal, deliveryFee, discount);

          const billInfo: IBill = {
            orderItems,
            subTotal: this.subTotal,
            deliveryFee,
            discount,
            total: this.totalPrice
          }
          this.emitBillInfo.emit(billInfo);
        }
      })
    )

    this.subscription.add(
      this.subInfoForm.valueChanges.pipe(
        startWith(this.subInfoForm.value)
      ).subscribe((value) => {
        const billSubInfo: IBillSubInfo = {
          orderStatus: value.orderStatus,
          note: value.orderNote,
          paymentMethod: value.paymentMethod
        }
        this.emitBillSubInfo.emit(billSubInfo);
      })
    )
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
    orderItem.quantity = value;
    orderItem.total = orderItem.price * orderItem.quantity;
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

  handlePaymentMethodChange(event: MatSelectChange) {
    const value = event.value as TPaymentMethod;
    this.subInfoForm.controls['paymentMethod'].setValue(value);
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
