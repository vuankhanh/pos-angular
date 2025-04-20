import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/module/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TSupplierModel } from '../shared/interface/supplier.interface';
import { TConfirmDialogData } from '../../../../shared/interface/confirm_dialog.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../../../shared/component/dialog/confirm/confirm.component';

import { filter, map, Subscription, switchMap } from 'rxjs';
import { HomeService } from '../shared/service/api/home.service';
import { AddressPipe } from '../../../../shared/pipe/address.pipe';
import { PhoneNumberPipe } from '../../../../shared/pipe/phone-number.pipe';

@Component({
  selector: 'app-home-detail',
  standalone: true,
  imports: [
    CommonModule,

    PhoneNumberPipe,
    AddressPipe,

    MaterialModule
  ],
  templateUrl: './home-detail.component.html',
  styleUrl: './home-detail.component.scss'
})
export class HomeDetailComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly homeService: HomeService = inject(HomeService);
  supplier?: TSupplierModel;

  private readonly subscription: Subscription = new Subscription();

  ngOnInit() {
    const supplierDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.homeService.getDetail(id))
    );

    this.subscription.add(
      supplierDetail$.subscribe({
        next: res => {
          this.supplier = res;
          console.log(this.supplier);

        },
        error: error => {
          this.goBackSupplierList();
        }
      })
    )
  }

  editSupplier(elementFocus?: string) {
    this.router.navigate(['/supplier/home-edit'], {
      queryParams: { elementFocus, _id: this.supplier?._id }
    });
  }

  deleteSupplier() {
    const data: TConfirmDialogData = {
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa nhà cung cấp ${this.supplier?.name} không?`,
      cancelText: 'Hủy',
      confirmText: 'Xóa'
    }
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data
    });

    dialogRef.afterClosed().pipe(
      filter(result => result),
      switchMap(() => this.homeService.remove(this.supplier!._id))
    ).subscribe({
      next: res => {
        this.goBackSupplierList();
      },
      error: error => {
        console.error(error);
      }
    });
  }

  goBackSupplierList() {
    this.router.navigate(['/supplier']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
