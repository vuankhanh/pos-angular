import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../../shared/service/api/product.service';
import { TProductModel } from '../../../shared/interface/product.interface';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product?: TProductModel;
  constructor(
    private productService: ProductService
  ) {}
  ngOnInit() {

  }

  ngOnDestroy() {}
}
