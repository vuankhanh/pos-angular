import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/module/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TSupplierProductModel } from '../shared/interface/supplier-product.interface';
import { filter, map, Subscription, switchMap } from 'rxjs';
import { ConfirmComponent } from '../../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../../shared/interface/confirm_dialog.interface';
import { ProductService } from '../shared/service/api/product.service';
import { CurrencyCustomPipe } from '../../../../shared/pipe/currency-custom.pipe';

@Component({
  selector: 'app-supplier-product-detail',
  standalone: true,
  imports: [
    CommonModule,


    CurrencyCustomPipe,

    MaterialModule
  ],
  templateUrl: './supplier-product-detail.component.html',
  styleUrl: './supplier-product-detail.component.scss'
})
export class SupplierProductDetailComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly supplierProductService: ProductService = inject(ProductService);
  supplierProduct?: TSupplierProductModel;

  private readonly subscription: Subscription = new Subscription();

  ngOnInit() {
    const supplierProductDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.supplierProductService.getDetail(id))
    );

    this.subscription.add(
      supplierProductDetail$.subscribe({
        next: res => {
          this.supplierProduct = res;
          console.log(this.supplierProduct);

        },
        error: error => {
          this.goBackSupplierProductList();
        }
      })
    )
  }

  editSupplierProduct(elementFocus?: string) {
    this.router.navigate(['/supplier/product-edit'], {
      queryParams: { elementFocus, _id: this.supplierProduct?._id }
    });
  }

  deleteSupplierProduct() {
    const data: TConfirmDialogData = {
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa sản phẩm nhà cung cấp ${this.supplierProduct?.name} không?`,
      cancelText: 'Hủy',
      confirmText: 'Xóa'
    }
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data
    });

    dialogRef.afterClosed().pipe(
      filter(result => result),
      switchMap(() => this.supplierProductService.remove(this.supplierProduct!._id))
    ).subscribe({
      next: res => {
        this.goBackSupplierProductList();
      },
      error: error => {
        console.error(error);
      }
    });
  }

  goBackSupplierProductList() {
    this.router.navigate(['/supplier/product']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
