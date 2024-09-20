import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, of, Subscription, switchMap } from 'rxjs';
import { MaterialModule } from '../../../shared/module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProduct, TProductModel } from '../../../shared/interface/product.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../shared/service/api/product.service';
import { MatDialog } from '@angular/material/dialog';
import { AlbumShowComponent } from '../../../shared/component/album-show/album-show.component';
import { TAlbumModel } from '../../../shared/interface/album.interface';
import { AlbumService, DetailParams } from '../../../shared/service/api/album.service';
import { GalleryComponent, GalleryItem } from '@daelmaak/ngx-gallery';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GalleryComponent,

    MaterialModule,

    SetBaseUrlPipe
  ],
  providers: [SetBaseUrlPipe],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit, OnDestroy {
  formGroup!: FormGroup;

  album?: TAlbumModel;
  galleryItems: GalleryItem[] = [];

  product?: TProductModel;

  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private setBaseUrlPipe: SetBaseUrlPipe,
    private productService: ProductService,
    private albumService: AlbumService
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.activatedRoute.queryParamMap.pipe(
        map(params => {
          const customerId = params.get('_id');
          
          return customerId;
        }),
        switchMap(customerId => {
          if (customerId) {
            return this.productService.getDetail(customerId)
          }
          return of(null);
        })
      ).subscribe({
        next: (res) => {
          if (res){
            this.product = res;
            if(this.product.albumId) {
              this.getAlbumDetail(this.product.albumId);
            }
          };
          this.initForm();
        },
        error: error => {

        }
      })
    )
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      name: [this.product?.name, [Validators.required]],
      price: [this.product?.price, [Validators.required]],
      availability: [this.product?.availability],
      unit: [this.product?.unit, [Validators.required]],
      albumId: [this.product?.albumId, [Validators.required]],
      description: [this.product?.description],
      usageInstructions: [this.product?.usageInstructions]
    });
  }

  isFormChanged(): boolean {
    return this.formGroup.dirty && !this.formGroup.pristine;
  }

  private create() {
    return this.productService.create(this.formGroup.value)
  }

  private update() {
    const changedControls: { [key: string]: any } = {};
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      if (control?.dirty) {
        changedControls[key] = control.value;
      }
    });

    return this.productService.update(this.product!._id, changedControls)
  }

  onSubmit() {
    const api$ = this.product?._id ? this.update() : this.create();
    this.subscription.add(
      api$.subscribe({
        next: res => {
          this.product = res;
          this.goBackProducDetail();
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  openAlbumDialog() {
    const dialogRef = this.dialog.open(AlbumShowComponent, {
      width: '800px'
    });
    this.subscription.add(
      dialogRef.afterClosed().subscribe((result: TAlbumModel) => {
        if (result) {
          console.log(result);
          this.formGroup.get('albumId')?.setValue(result._id);
          this.getAlbumDetail(result._id);
        }
      })
    )
  }

  private getAlbumDetail(albumId: string) {
    const detailParams: DetailParams = {
      id: albumId
    }
    this.subscription.add(
      this.albumService.getDetail(detailParams).subscribe({
        next: res => {
          this.album = res;
          const galleryItems: GalleryItem[] = res.media.map(media => {
            return {
              src: this.setBaseUrlPipe.transform(media.url),
              thumbSrc: this.setBaseUrlPipe.transform(media.thumbnailUrl),
              text: media.caption,
              video: media.type === 'video' ? true : false
            }
          })
          this.galleryItems = galleryItems;
          console.log(this.galleryItems);

        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  goBackProducDetail() {
    const commands = this.product?._id ? ['/product', this.product?._id] : ['/product'];
    this.router.navigate(commands);
  };

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
