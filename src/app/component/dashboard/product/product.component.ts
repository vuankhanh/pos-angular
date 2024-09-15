import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../shared/service/api/product.service';
import { TProductModel } from '../../../shared/interface/product.interface';
import { IPagination } from '../../../shared/interface/pagination.interface';
import { paginationConstant } from '../../../constant/pagination.constant';
import { MatCommonModule } from '@angular/material/core';
import { MaterialModule } from '../../../shared/module/material';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    MatCommonModule,

    MaterialModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy {
  products?: TProductModel[];
  pagination: IPagination = paginationConstant;

  subscription: Subscription = new Subscription();
  constructor(
    private productService: ProductService
  ) {
  }

  ngOnInit() {
    this.initProduct('', this.pagination.page, this.pagination.size);
  }

  private initProduct(productName: string, page: number, size: number) {
    this.subscription.add(
      this.productService.getAll(productName, page, size).subscribe((res) => {
        this.products = res.data;
        this.pagination = res.paging;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
