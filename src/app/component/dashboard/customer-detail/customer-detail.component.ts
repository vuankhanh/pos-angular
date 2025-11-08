import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TCustomerModel } from '../../../shared/interface/customer.interface';
import { CustomerService } from '../../../shared/service/api/customer.service';
import { filter, map, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/module/material';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';
import { PhoneNumberPipe } from '../../../shared/pipe/phone-number.pipe';
import { MyDialogService } from '../../../shared/service/my-dialog.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,

    MaterialModule,

    PhoneNumberPipe
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);
  private readonly myDialogService = inject(MyDialogService);

  customer?: TCustomerModel;

  subscription: Subscription = new Subscription();
  constructor(

  ) { }

  ngOnInit() {
    const customerDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.customerService.getDetail(id))
    );

    this.subscription.add(
      customerDetail$.subscribe({
        next: res => {
          this.customer = res;
        },
        error: error => {
          this.goBackCustomerList();
        }
      })
    )
  }

  editCustomer(elementFocus?: string) {
    this.router.navigate(['/customer-edit'], {
      queryParams: { elementFocus, _id: this.customer?._id }
    });
  }

  deleteCustomer() {
    const data: TConfirmDialogData = {
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa khách hàng ${this.customer?.name} không?`,
      cancelText: 'Hủy',
      confirmText: 'Xóa'
    }
    const dialogRef = this.myDialogService.open(ConfirmComponent, {
      data
    });

    this.subscription.add(
      dialogRef.afterClosed().pipe(
        filter(result => result),
        switchMap(() => this.customerService.remove(this.customer!._id))
      ).subscribe({
        next: res => {
          this.goBackCustomerList();
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  goBackCustomerList() {
    this.router.navigate(['/customer']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
