import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { PurchaseOrderItem, TPurchaseOrder } from '../../../shared/interface/purchase-order.interface';
import { TSupplierProductModel } from '../supplier/shared/interface/supplier-product.interface';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
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

@Component({
  selector: 'app-purchase-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    NumberInputComponent,
    CurrencyCustomPipe,

    MaterialModule
  ],
  templateUrl: './purchase-order-edit.component.html',
  styleUrl: './purchase-order-edit.component.scss'
})
export class PurchaseOrderEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nameOrProductEl') nameOrProductEl!: ElementRef<MatInput>;
  @ViewChild('statusEl') statusEl!: MatSelect;
  @ViewChild(MatTable) table?: MatTable<any>;

  purchaseOrder?: TPurchaseOrder;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly renderer = inject(Renderer2);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly productService = inject(ProductService);
  private readonly breakpointDetectionService = inject(BreakpointDetectionService);
  private readonly formBuilder = inject(FormBuilder);

  private formGroup!: FormGroup;
  private readonly bFormgroupValid: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  formGroupValid$: Observable<boolean> = this.bFormgroupValid.asObservable();

  purchaseOrderStatus$ = purchaseOrderStatus$;

  private readonly bPurchaseOrderItems: BehaviorSubject<PurchaseOrderItem[]> = new BehaviorSubject<PurchaseOrderItem[]>([]);
  purchaseOrderItems$: Observable<PurchaseOrderItem[]> = this.bPurchaseOrderItems.asObservable();

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
          const purchaseOrderItems: PurchaseOrderItem[] = purchaseOrder.purchaseOrderItems.map(item=>{
            return new PurchaseOrderItem({
              product: item.product,
              quantity: item.discount,
              discount: item.discount || 0
            });
          });

          this.bPurchaseOrderItems.next(purchaseOrderItems);
          this.purchaseOrder = purchaseOrder;
          console.log(this.purchaseOrder);
          
        }
        this.initForm();
      },
      error: error => {
        this.backToOrderDetail();
      }
    });
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      status: [this.purchaseOrder?.status || PurchaseOrderStatus.CREATED, Validators.required],
      purchaseOrderItems: [this.purchaseOrder?.purchaseOrderItems || [], [Validators.required, Validators.minLength(1)]]
    });

    this.subscription.add(
      this.formGroup.valueChanges.subscribe((value) => {
        this.bFormgroupValid.next(this.formGroup.valid);
      })
    )
  }

  get purchaseOrderItemsControl() {
    return this.formGroup.get('purchaseOrderItems') as FormArray;
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.nameOrProductEl.nativeElement, 'input', (event: InputEvent ) => {
      this.bNameOrProductElChange.next(this.nameOrProductEl.nativeElement.value);
    });

    setTimeout(() => {
      this.statusEl.value = this.purchaseOrder?.status || PurchaseOrderStatus.CREATED;
    }, 150);
    // this.statusEl.options.forEach((option) => {
    //   console.log(option);
      
    // });

    // this.statusEl.nativeElement.value = this.purchaseOrder?.status || PurchaseOrderStatus.CREATED;
  }

  onChooseProductEvent(event: MatAutocompleteSelectedEvent) {
    const product = event.option.value as TSupplierProductModel;
    this.nameOrProductEl.nativeElement.value = '';
    this.bNameOrProductElChange.next('');
    
    const orderItem = new PurchaseOrderItem({
      product: product,
      quantity: 1,
      discount: 0
    });

    const orderItems = this.bPurchaseOrderItems.value;
    orderItems.push(orderItem);
    this.bPurchaseOrderItems.next(orderItems);
    this.purchaseOrderItemsControl.setValue(orderItems);
    this.table?.renderRows()
  }



  quantityChange(value: number, orderItem: PurchaseOrderItem) {
    orderItem.quantity = value;
    orderItem.itemTotal = orderItem.product.price * orderItem.quantity;
    const orderItems = this.bPurchaseOrderItems.value;
    this.bPurchaseOrderItems.next(orderItems);
    this.table?.renderRows();
  }

  removeItemQuantity(index: number) {
    // const orderItems = this.orderItems$.value;
    // orderItems.splice(index, 1);
    // this.orderItems$.next(orderItems);
    // this.table?.renderRows();
  }

  groupedOrderItems$: Observable<GroupedOrderItems[]> = this.purchaseOrderItems$.pipe(
    map((items) =>{
      const grouped = this.groupBySupplier(items);
      return grouped;
    })
  );

  private groupBySupplier(orderItems: PurchaseOrderItem[]): GroupedOrderItems[] {
    const grouped = orderItems.reduce((acc, item) => {
      const supplierName = item.product.supplierLocationName; // Assuming `supplierName` exists in product
      if (!acc[supplierName]) {
        acc[supplierName] = { productSupplierName: supplierName, orderItems: [], totalPrice: 0 };
      }
      acc[supplierName].orderItems.push(item);
      acc[supplierName].totalPrice += item.itemTotal;
      return acc;
    }, {} as Record<string, GroupedOrderItems>);

    return Object.values(grouped);
  }

  onStatusChange(event: `${PurchaseOrderStatus}`) {
    console.log(event);
    this.formGroup.get('status')?.setValue(event);
  }

  backToOrderDetail() {
    const commands = this.purchaseOrder?._id ? ['/purchase-order', this.purchaseOrder?._id] : ['/purchase-order'];
    this.router.navigate(commands);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
