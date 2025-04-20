import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BreakpointDetectionService } from '../../../../shared/service/breakpoint-detection.service';
import { HomeService } from '../shared/service/api/home.service';
import { TSupplierModel } from '../shared/interface/supplier.interface';
import { IPagination } from '../../../../shared/interface/pagination.interface';
import { paginationConstant } from '../../../../constant/pagination.constant';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/module/material';
import { SearchComponent } from '../../../../shared/component/search/search.component';
import { AddressPipe } from '../../../../shared/pipe/address.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    MaterialModule,

    AddressPipe,

    SearchComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly homeService: HomeService = inject(HomeService);

  suppliers: Array<TSupplierModel> = [];
  pagination: IPagination = paginationConstant;
  pageSizeOptions: number[] = [2, 5, 10, 25, 100];

  nameSearch: string = '';

  breakpointDetection$ = this.breakpointDetectionService.detection$();
  private readonly subscription: Subscription = new Subscription();

  ngOnInit() {
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  private getAll(name: string, page: number, size: number) {
    this.subscription.add(
      this.homeService.getAll(name, page, size).subscribe(res => {
        this.suppliers = res.data;
        this.pagination = res.paging;
      })
    )
  }

  onSearch(value: string) {
    this.pagination = paginationConstant
    this.nameSearch = value;
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  onCreateSupplier() {
    this.router.navigate(['supplier/home-edit']);
  }

  handlePageEvent(event: PageEvent) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.size = event.pageSize;
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
