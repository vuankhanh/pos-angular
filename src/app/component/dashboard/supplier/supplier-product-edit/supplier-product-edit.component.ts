import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../shared/service/api/product.service';
import { TSupplierProductModel } from '../shared/interface/supplier-product.interface';
import { BehaviorSubject, catchError, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/module/material';
import { TSupplierLocationModel } from '../shared/interface/supplier-location.interface';
import { LocationService } from '../shared/service/api/location.service';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SupplierProductUnit } from '../../../../constant/product.constant';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-supplier-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    NgxMaskDirective,

    MaterialModule
  ],
  templateUrl: './supplier-product-edit.component.html',
  styleUrl: './supplier-product-edit.component.scss'
})
export class SupplierProductEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('formElement') formElements!: QueryList<ElementRef>;
  @ViewChild('supplierEl') supplierEl!: ElementRef<MatInput>;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly renderer = inject(Renderer2);

  private readonly locationService = inject(LocationService);
  private readonly supplierProductService = inject(ProductService);
  supplierProduct?: TSupplierProductModel;

  formGroup!: FormGroup;
  private readonly bSupplierEl: BehaviorSubject<string> = new BehaviorSubject<string>('');

  productUnits = Object.values(SupplierProductUnit);

  suppliers$: Observable<Array<TSupplierLocationModel>> = this.locationService.getAllData().pipe(
    switchMap((suppliers: Array<TSupplierLocationModel>) => {
      return this.bSupplierEl.pipe(
        startWith(''),
        map((value: string) => {
          const filterValue = value.toLowerCase();
          return suppliers.filter((supplier: TSupplierLocationModel) => {
            return supplier.name.toLowerCase().includes(filterValue);
          });
        }),
      )
    })
  );

  private supplierSelected: TSupplierLocationModel | null = null;

  private readonly bControlFormChanged: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject<{ [key: string]: any }>({});
  private readonly controlFormChanged$: Observable<{ [key: string]: any }> = this.bControlFormChanged.asObservable();
  isFormChanged$: Observable<boolean> = this.controlFormChanged$.pipe(
    map((value: { [key: string]: any }) => {
      return Object.keys(value).length > 0;
    }),
  );
  private readonly subscription: Subscription = new Subscription();

  constructor() {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      unit: ['', Validators.required],
      supplierLocationId: ['', Validators.required],
      description: [''],
    });

    this.subscription.add(
      this.formGroup.valueChanges.subscribe((value) => {
        //Lấy ra các control đã thay đổi
        const changedControls: { [key: string]: any } = {};
        Object.keys(value).forEach(key => {
          if(!this.supplierProduct) return;
          if(value[key] !== this.supplierProduct[key as keyof TSupplierProductModel]) {
            changedControls[key] = value[key];
          }
        });

        this.bControlFormChanged.next(changedControls);
      })
    )
  }

  ngOnInit(): void {
    // Initialize any necessary data or services here
  }

  ngAfterViewInit() {
    this.subscription.add(
      this.activatedRoute.queryParamMap.pipe(
        map(params => {
          const supplierLocationId = params.get('_id');
          const elementFocus = params.get('elementFocus');

          return { supplierLocationId, elementFocus };
        }),
        switchMap(res => {
          if (res.supplierLocationId) {
            return this.supplierProductService.getDetail(res.supplierLocationId).pipe(
              switchMap((supplierProduct: TSupplierProductModel) => {
                return this.locationService.getDetail(supplierProduct.supplierLocationId).pipe(
                  catchError(err => {
                    return of(null);
                  }),
                  map(supplier => ({ elementFocus: res.elementFocus, supplierProduct, supplier }))
                )
              }),
            )
          }
          return of(null);
        })
      ).subscribe({
        next: (res) => {
          if (res) {
            const elementFocus = res.elementFocus;
            this.supplierProduct = res.supplierProduct;
            this.supplierSelected = res.supplier;
            if (elementFocus) {
              setTimeout(() => {
                this.findAndFocusElement(elementFocus);
              }, 150);
            }
            this.formGroup.patchValue(this.supplierProduct);
            this.supplierEl.nativeElement.value = this.supplierSelected?.name || '';
            this.cdRef.detectChanges();
          }
        },
        error: error => {
          this.goBackSupplierProductDetail();
        }
      })
    );

    this.renderer.listen(this.supplierEl.nativeElement, 'input', () => {
      this.bSupplierEl.next(this.supplierEl.nativeElement.value);
    });
  }

  private findAndFocusElement(elementFocus: string) {
    const elementToFocus = this.formElements.find(el => el.nativeElement.getAttribute('formcontrolname') === elementFocus);
    if (elementToFocus) {
      elementToFocus.nativeElement.focus();
    }
  }

  onSupplierBlur(event: FocusEvent) {
    const supplierSelectedName = this.supplierSelected?.name;
    this.supplierEl.nativeElement.value = supplierSelectedName ? supplierSelectedName : '';
  }

  onSupplierOptionSelected(event: MatAutocompleteSelectedEvent) {
    const supplier: TSupplierLocationModel = event.option.value;
    this.supplierSelected = supplier;
    this.supplierEl.nativeElement.value = supplier.name;
    this.formGroup.get('supplierLocationId')?.setValue(supplier._id);
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      return;
    }
    const api$ = this.supplierProduct?._id ? this.update() : this.create();
    this.subscription.add(
      api$.subscribe({
        next: res => {
          this.goBackSupplierProductDetail();
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  private create() {
    return this.supplierProductService.create(this.formGroup.value);
  }

  private update() {
    return this.controlFormChanged$.pipe(
      switchMap((value: { [key: string]: any }) => {
        return this.supplierProductService.update(this.supplierProduct?._id!, value);
      })
    )
  }

  goBackSupplierProductDetail() {
    const commands = this.supplierProduct?._id ? ['/supplier/product', this.supplierProduct?._id] : ['/supplier/product'];
    this.router.navigate(commands);
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
