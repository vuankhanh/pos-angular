import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointDetectionService } from '../../../../shared/service/breakpoint-detection.service';
import { ProductService } from '../shared/service/api/product.service';
import { TSupplierProductModel } from '../shared/interface/supplier-product.interface';
import { IPagination } from '../../../../shared/interface/pagination.interface';
import { paginationConstant } from '../../../../constant/pagination.constant';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/module/material';
import { SearchComponent } from '../../../../shared/component/search/search.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-supplier-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    MaterialModule,

    SearchComponent
  ],
  templateUrl: './supplier-product.component.html',
  styleUrl: './supplier-product.component.scss'
})
export class SupplierProductComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly productService: ProductService = inject(ProductService);

  supplierProducts: Array<TSupplierProductModel> = [];
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
      this.productService.getAll(name, page, size).subscribe(res => {
        this.supplierProducts = res.data;
        this.pagination = res.paging;
      })
    )
  }

  onSearch(value: string) {
    this.pagination = paginationConstant
    this.nameSearch = value;
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  onCreateProduct() {
    this.router.navigate(['supplier/product-edit']);
  }

  handlePageEvent(event: PageEvent) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.size = event.pageSize;
    this.getAll(this.nameSearch, this.pagination.page, this.pagination.size);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
