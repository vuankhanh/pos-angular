import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/module/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TSupplierLocationModel } from '../shared/interface/supplier-location.interface';
import { TConfirmDialogData } from '../../../../shared/interface/confirm_dialog.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../../../shared/component/dialog/confirm/confirm.component';

import { filter, map, Subscription, switchMap } from 'rxjs';
import { LocationService } from '../shared/service/api/location.service';
import { AddressPipe } from '../../../../shared/pipe/address.pipe';
import { PhoneNumberPipe } from '../../../../shared/pipe/phone-number.pipe';
import { CurrencyCustomPipe } from '../../../../shared/pipe/currency-custom.pipe';
import { UpdateSupplierDebtComponent } from '../../../../shared/component/dialog/update-supplier-debt/update-supplier-debt.component';
import { ReplaceNewLinePipe } from '../../../../shared/pipe/replace-new-line.pipe';

@Component({
  selector: 'app-supplier-location-detail',
  standalone: true,
  imports: [
    CommonModule,

    PhoneNumberPipe,
    AddressPipe,
    CurrencyCustomPipe,
    ReplaceNewLinePipe,

    MaterialModule
  ],
  templateUrl: './supplier-location-detail.component.html',
  styleUrl: './supplier-location-detail.component.scss'
})
export class SupplierLocationDetailComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly locationService = inject(LocationService);
  supplier?: TSupplierLocationModel;

  private readonly subscription: Subscription = new Subscription();

  ngOnInit() {
    const supplierDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.locationService.getDetail(id))
    );

    this.subscription.add(
      supplierDetail$.subscribe({
        next: res => {
          this.supplier = res;
        },
        error: error => {
          this.goBackSupplierLocationList();
        }
      })
    )
  }

  editSupplierLocation(elementFocus?: string) {
    this.router.navigate(['/supplier/location-edit'], {
      queryParams: { elementFocus, _id: this.supplier?._id }
    });
  }

  updateDebt() {
    const dialogRef = this.dialog.open(UpdateSupplierDebtComponent, {
      data: this.supplier
    });

    this.subscription.add(
      dialogRef.afterClosed().pipe(
        filter(result => !!result)
      ).subscribe({
        next: (res: TSupplierLocationModel) => {
          this.supplier = res;
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  deleteSupplierLocation() {
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
      switchMap(() => this.locationService.remove(this.supplier!._id))
    ).subscribe({
      next: res => {
        this.goBackSupplierLocationList();
      },
      error: error => {
        console.error(error);
      }
    });
  }

  goBackSupplierLocationList() {
    this.router.navigate(['/supplier']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
