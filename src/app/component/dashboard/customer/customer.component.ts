import { Component } from '@angular/core';
import { CustomerService } from '../../../shared/service/api/customer.service';
import { IPagination } from '../../../shared/interface/pagination.interface';
import { Subscription } from 'rxjs';
import { ICustomer, TCustomerModel } from '../../../shared/interface/customer.interface';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { SearchComponent } from '../../../shared/component/search/search.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { paginationConstant } from '../../../constant/pagination.constant';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../../shared/module/material';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { PhoneNumberPipe } from '../../../shared/pipe/phone-number.pipe';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    SearchComponent,

    MaterialModule,

    PhoneNumberPipe
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {
  customers: Array<TCustomerModel> = [];
  pagination: IPagination = paginationConstant;
  pageSizeOptions: number[] = [2, 5, 10, 25, 100];

  nameSearch: string = '';

  breakpointDetection$ = this.breakpointDetectionService.detection$();
  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private customerService: CustomerService,
    private breakpointDetectionService: BreakpointDetectionService
  ) { }

  ngOnInit() {
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  private getAll(name:string, page: number, size: number) {
    this.subscription.add(
      this.customerService.getAll(name, page, size).subscribe(res => {
        this.customers = res.data;
        this.pagination = res.paging;
      })
    )
  }

  onSearch(value: string) {
    this.pagination = paginationConstant
    this.nameSearch = value;
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  onCreateCustomer() {
    this.router.navigate(['/customer-edit']);
  }

  handlePageEvent(event: PageEvent) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.size = event.pageSize;
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }
}
