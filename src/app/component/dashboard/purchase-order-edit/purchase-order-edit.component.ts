import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { PurchaseOrderItem, TPurchaseOrder } from '../../../shared/interface/purchase-order.interface';
import { TSupplierProductModel } from '../supplier/shared/interface/supplier-product.interface';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, map, Observable, of, Subscription, switchMap, take, tap } from 'rxjs';
import { ProductService } from '../supplier/shared/service/api/product.service';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';
import { NumberInputComponent } from '../../../shared/component/number-input/number-input.component';
import { GroupedOrderItems } from '../../../shared/interface/grouped-order-items.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from '../../../shared/service/api/purchase-order.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { PurchaseOrderStatus, purchaseOrderStatus$ } from '../../../constant/order.constant';
import { MatSelect } from '@angular/material/select';
import { isEqual } from 'lodash';
import { PurchaseOrderUtil } from '../../../shared/utitl/purchase-order.util';
import { AsyncDebtBadgeDirective } from '../../../shared/directive/async-debt-badge.directive';
import { LongPressDirective } from "../../../shared/directive/long-press.directive";
import { InputFeeComponent } from '../../../shared/component/input-fee/input-fee.component';
import { IInputFeeDialogData } from '../../../shared/interface/input-fee-dialog.interface';
import { CanComponentDeactivate } from '../../../shared/interface/can-component-deactivate.interface';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';
import { MyDialogService } from '../../../shared/service/my-dialog.service';

@Component({
  selector: 'app-purchase-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NumberInputComponent,
    CurrencyCustomPipe,
    AsyncDebtBadgeDirective,
    MaterialModule,
    LongPressDirective
  ],
  templateUrl: './purchase-order-edit.component.html',
  styleUrl: './purchase-order-edit.component.scss'
})
export class PurchaseOrderEditComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
  @ViewChild('nameOrProductEl') nameOrProductEl!: ElementRef<MatInput>;
  @ViewChild('statusEl') statusEl!: MatSelect;
  @ViewChild(MatTable) table?: MatTable<any>;

  purchaseOrder?: TPurchaseOrder;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly myDialogService = inject(MyDialogService);
  private readonly renderer = inject(Renderer2);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly productService = inject(ProductService);
  private readonly breakpointDetectionService = inject(BreakpointDetectionService);
  private readonly formBuilder = inject(FormBuilder);

  formGroup!: FormGroup;
  private initialFormValue: unknown;
  private readonly bControlFormChanged: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject<{ [key: string]: any }>({});
  private readonly controlFormChanged$: Observable<{ [key: string]: any }> = this.bControlFormChanged.asObservable();
  isFormChanged$: Observable<boolean> = this.controlFormChanged$.pipe(
    map((value: { [key: string]: any }) => {
      return Object.keys(value).length > 0;
    }),
  );

  purchaseOrderStatus$ = purchaseOrderStatus$;

  private readonly bPurchaseOrderItems: BehaviorSubject<PurchaseOrderItem[]> = new BehaviorSubject<PurchaseOrderItem[]>([]);
  purchaseOrderItems$: Observable<PurchaseOrderItem[]> = this.bPurchaseOrderItems.asObservable();
  groupedOrderItems$: Observable<GroupedOrderItems[]> = this.purchaseOrderItems$.pipe(
    map((items) => {
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

  private readonly bNameOrProductElChange: BehaviorSubject<string> = new BehaviorSubject<string>('');
  filteredOptions$: Observable<TSupplierProductModel[]> = this.bNameOrProductElChange.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((nameOrProduct) => this.productService.getAll(nameOrProduct).pipe(
      map((data) => data.data)
    ))
  );

  breakpointDetection$ = this.breakpointDetectionService.detection$();

  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      status: [this.purchaseOrder?.status || PurchaseOrderStatus.CREATED, Validators.required],
      purchaseOrderItems: [this.purchaseOrder?.purchaseOrderItems || [], [Validators.required, Validators.minLength(1)]]
    });

    this.initialFormValue = this.formGroup.getRawValue();
    
    this.subscription.add(
      this.formGroup.valueChanges.subscribe(value => {
        const changedControls: { [key: string]: any } = {};
        Object.keys(value).forEach(key => {
          if (!this.purchaseOrder) return;
          // Bỏ qua nếu không thay đổi
          if (!isEqual(value[key], this.purchaseOrder[key as keyof TPurchaseOrder])) {
            changedControls[key] = value[key];
          }
        });

        this.bControlFormChanged.next(changedControls);
      })
    )
    this.subscription.add(
      this.activatedRoute.queryParamMap.pipe(
        switchMap(params => {
          const id: string = params.get('_id') as string;
          const purchaseOrderService$ = id ? this.purchaseOrderService.getDetail(id) : of(null);
          return purchaseOrderService$;
        }),
      ).subscribe({
        next: (purchaseOrder) => {
          if (purchaseOrder) {
            // Xử lý purchaseOrderDetail
            const purchaseOrderItems: PurchaseOrderItem[] = purchaseOrder.purchaseOrderItems.map(item => {
              return new PurchaseOrderItem({
                product: item.product,
                quantity: item.quantity,
                discount: item.discount || 0
              });
            });

            this.bPurchaseOrderItems.next(purchaseOrderItems);
            this.purchaseOrder = purchaseOrder;
          }
          this.formGroup.get('status')?.setValue(purchaseOrder?.status || PurchaseOrderStatus.CREATED);
          this.formGroup.get('purchaseOrderItems')?.setValue(purchaseOrder?.purchaseOrderItems || []);
        },
        error: error => {
          this.backToOrderDetail();
        }
      })
    )
  }

  get purchaseOrderItemsControl() {
    return this.formGroup.get('purchaseOrderItems') as FormArray;
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.nameOrProductEl.nativeElement, 'input', (event: InputEvent) => {
      this.bNameOrProductElChange.next(this.nameOrProductEl.nativeElement.value);
    });

    setTimeout(() => {
      this.statusEl.value = this.purchaseOrder?.status || PurchaseOrderStatus.CREATED;
    }, 150);
  }

  onChooseProductEvent(event: MatAutocompleteSelectedEvent) {
    const product = event.option.value as TSupplierProductModel;
    this.nameOrProductEl.nativeElement.value = '';
    this.bNameOrProductElChange.next('');

    const orderItems = this.bPurchaseOrderItems.value;

    // Kiểm tra nếu sản phẩm đã tồn tại
    const existingOrderItem = orderItems.find(item => item.product._id === product._id);
    if (existingOrderItem) {
      // Nếu tồn tại, tăng quantity lên 1
      existingOrderItem.quantity += 1;
      existingOrderItem.itemTotal = existingOrderItem.product.price * existingOrderItem.quantity;
    } else {
      // Nếu chưa tồn tại, thêm sản phẩm mới
      const orderItem = new PurchaseOrderItem({
        product: product,
        quantity: 1,
        discount: 0
      });
      orderItems.push(orderItem);
    }
    this.bPurchaseOrderItems.next(orderItems);
    this.purchaseOrderItemsControl.setValue(orderItems);
    this.table?.renderRows();
  }

  onPriceLongPress(event: MouseEvent, orderItem: PurchaseOrderItem) {
    event.preventDefault();
    this.openInputPriceDialog(orderItem);
  }

  onPriceLongTouch(event: TouchEvent, orderItem: PurchaseOrderItem) {
    event.preventDefault();
    this.openInputPriceDialog(orderItem);
  }

  private openInputPriceDialog(orderItem: PurchaseOrderItem) {
    const data: IInputFeeDialogData = {
      title: 'Cập nhật giá mới',
      message: 'Cập nhật giá mới',
      fee: orderItem.product.price
    }
    const dialogRef = this.myDialogService.open(InputFeeComponent, {
      data
    });

    this.subscription.add(
      dialogRef.afterClosed().pipe(
        filter(result => !!result),
        switchMap((price: number) => this.productService.update(orderItem.product._id, { price }))
      ).subscribe(result => {
        if (result) {
          console.log(result);
          orderItem.product.price = result.price;
          orderItem.itemTotal = orderItem.product.price * orderItem.quantity;
          const orderItems = this.bPurchaseOrderItems.value;
          this.bPurchaseOrderItems.next(orderItems);
          this.purchaseOrderItemsControl.setValue(orderItems);
          this.table?.renderRows();
        }
      })
    )
  }

  quantityChange(value: number, orderItem: PurchaseOrderItem) {
    orderItem.quantity = value;
    orderItem.itemTotal = orderItem.product.price * orderItem.quantity;
    const orderItems = this.bPurchaseOrderItems.value;
    this.bPurchaseOrderItems.next(orderItems);
    this.purchaseOrderItemsControl.setValue(orderItems);
    this.table?.renderRows();
  }

  removeItemQuantity(orderItem: PurchaseOrderItem) {
    const data: TConfirmDialogData = {
      title: 'Xoá sản phẩm',
      message: `Bạn có chắc muốn xóa ${orderItem.product.name}?`,
      cancelText: 'Hủy',
      confirmText: 'Xoá',
      confirmColor: 'warn'
    }
    
    this.subscription.add(
      this.myDialogService.open(ConfirmComponent, { data }).afterClosed().pipe(
        take(1),
        filter(result => !!result)
      ).subscribe(() => {
        const orderItems = this.bPurchaseOrderItems.value;
        const index = orderItems.findIndex(item => item.product._id === orderItem.product._id);
        if (index === -1) return; // Không tìm thấy sản phẩm trong danh sách
        orderItems.splice(index, 1);
        this.bPurchaseOrderItems.next(orderItems);
        this.purchaseOrderItemsControl.setValue(orderItems);
      })
    )
  }

  onStatusChange(event: `${PurchaseOrderStatus}`) {
    this.formGroup.get('status')?.setValue(event);
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      return;
    }
    const api$ = this.purchaseOrder?._id ? this.update() : this.create();
    this.subscription.add(
      api$.subscribe({
        next: res => {
          this.formGroup.reset(this.initialFormValue);
          this.bControlFormChanged.next({});
          this.backToOrderDetail();
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  private create() {
    const status = this.formGroup.get('status')?.value as `${PurchaseOrderStatus}`;
    const purchaseOrderItems = this.formGroup.get('purchaseOrderItems')?.value as PurchaseOrderItem[];
    return this.purchaseOrderService.create(status, purchaseOrderItems);
  }

  private update() {
    return this.controlFormChanged$.pipe(
      switchMap((value: { [key: string]: any }) => {
        return this.purchaseOrderService.update(this.purchaseOrder?._id!, value);
      })
    )
  }

  backToOrderDetail() {
    const commands = this.purchaseOrder?._id ? ['/purchase-order', this.purchaseOrder?._id] : ['/purchase-order'];
    this.router.navigate(commands);
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.purchaseOrder){
      const purchaseOrderItemsLength = this.formGroup.get('purchaseOrderItems')?.value.length;
      console.log(purchaseOrderItemsLength);
      
      if(purchaseOrderItemsLength === 0) return true;

      return this.openConfirmDialog();
    };

    return this.isFormChanged$.pipe(
      switchMap(isChanged => {
        if (!isChanged) return of(true);

        return this.openConfirmDialog();
      })
    );
  }

  private openConfirmDialog() {
    const data: TConfirmDialogData = {
      title: 'Xử lý thay đổi',
      message: 'Bản thay đổi chưa lưu. Bản cơ chúc muốn hóa khóa bản thay đổi?',
      cancelText: 'Hủy',
      confirmText: 'Vẫn thoát'
    }

    return this.myDialogService.open(ConfirmComponent, { data }).afterClosed().pipe(
      map(result => !!result),
      tap((result) => console.log(result))
    ); 
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
