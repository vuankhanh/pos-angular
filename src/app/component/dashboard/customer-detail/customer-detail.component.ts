import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TCustomerModel } from '../../../shared/interface/customer.interface';
import { CustomerService } from '../../../shared/service/api/customer.service';
import { filter, map, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/module/material';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,

    ConfirmComponent,

    MaterialModule
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  customer?: TCustomerModel;

  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private customerService: CustomerService
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
          console.log(this.customer);
          
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
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data
    });

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
    });
  }

  goBackCustomerList() {
    this.router.navigate(['/customer']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
