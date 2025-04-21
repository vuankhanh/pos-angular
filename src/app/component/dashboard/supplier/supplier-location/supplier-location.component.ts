import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BreakpointDetectionService } from '../../../../shared/service/breakpoint-detection.service';
import { LocationService } from '../shared/service/api/location.service';
import { TSupplierLocationModel } from '../shared/interface/supplier-location.interface';
import { IPagination } from '../../../../shared/interface/pagination.interface';
import { paginationConstant } from '../../../../constant/pagination.constant';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/module/material';
import { SearchComponent } from '../../../../shared/component/search/search.component';
import { AddressPipe } from '../../../../shared/pipe/address.pipe';

@Component({
  selector: 'app-supplier-location',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    MaterialModule,

    AddressPipe,

    SearchComponent
  ],
  templateUrl: './supplier-location.component.html',
  styleUrl: './supplier-location.component.scss'
})
export class SupplierLocationComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly locationService: LocationService = inject(LocationService);

  suppliers: Array<TSupplierLocationModel> = [];
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
      this.locationService.getAll(name, page, size).subscribe(res => {
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

  onCreateSupplierLocation() {
    this.router.navigate(['supplier/location-edit']);
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
