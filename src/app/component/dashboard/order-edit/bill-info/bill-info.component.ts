import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/module/material';
import { TProductModel } from '../../../../shared/interface/product.interface';
import { debounceTime, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';
import { OrderItem } from '../../../../shared/interface/order.interface';
import { ProductService } from '../../../../shared/service/api/product.service';
import { SetBaseUrlPipe } from '../../../../shared/pipe/set-base-url.pipe';
import { MatTable } from '@angular/material/table';
import { CurrencyCustomPipe } from '../../../../shared/pipe/currency-custom.pipe';

@Component({
  selector: 'order-bill-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

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
export class BillInfoComponent implements OnInit, OnDestroy{
  @ViewChild(MatTable) table?: MatTable<any>
  nameOrProductCodeCtl: FormControl = new FormControl();
  filteredOptions$!: Observable<TProductModel[]>;
  orderItems: OrderItem[] = [];
  displayedColumns = ['thumbnail', 'name', 'quantity', 'price', 'total', 'actions'];

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.filteredOptions$ = this.nameOrProductCodeCtl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.getProduct())
    );
  }

  getProduct(){
    return this.productService.getAll(this.nameOrProductCodeCtl.value as string).pipe(
      map((data) => data.data)
    )
  }
  onChooseProductEvent(product: TProductModel) {
    console.log(product);
    const orderItem = new OrderItem(product);
    console.log(orderItem);
    
    this.orderItems.push(orderItem);
    this.table?.renderRows()
  }

  orderItemsQuantityChange(orderItem: OrderItem){
    orderItem.updateQuantity = orderItem.quantity;
    this.table?.renderRows();
  }

  removeItemQuantity(index: number){
    this.orderItems.splice(index, 1);
    this.table?.renderRows();
  }

  ngOnDestroy(): void {
    
  }
}
