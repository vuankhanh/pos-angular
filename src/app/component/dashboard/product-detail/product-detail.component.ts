import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../../shared/service/api/product.service';
import { TProductModel } from '../../../shared/interface/product.interface';
import { CommonModule } from '@angular/common';
import { map, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/module/material';
import { GalleryComponent, GalleryItem } from '@daelmaak/ngx-gallery';
import { GalleryService } from '../../../shared/service/gallery.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,

    GalleryComponent,

    MaterialModule,
    
    CurrencyCustomPipe
  ],
  providers: [
    CurrencyCustomPipe
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product?: TProductModel;
  galleryItems: GalleryItem[] = [];
  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private gallerySerive: GalleryService
  ) {}
  ngOnInit() {
    const customerDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.productService.getDetail(id))
    );

    this.subscription.add(
      customerDetail$.subscribe({
        next: res => {
          this.product = res;
          this.galleryItems = this.gallerySerive.transform(this.product.albumDetail.media);
          console.log(this.product);
          
        },
        error: error => {
          this.goBackProductList();
        }
      })
    )
  }

  onEditEvent() {
    this.router.navigate(['/product-edit'], {
      queryParams: { _id: this.product!._id }
    });
  }

  onOrderEvent() {
    this.router.navigate(['/order-edit'], {
      queryParams: { productId: this.product!._id }
    })
  }

  goBackProductList() {
    this.router.navigate(['/product']);
  }

  ngOnDestroy() {}
}
