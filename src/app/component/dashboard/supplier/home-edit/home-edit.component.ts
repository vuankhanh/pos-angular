import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MaterialModule } from '../../../../shared/module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TSupplierModel } from '../shared/interface/supplier.interface';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, skipUntil, skipWhile, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../shared/service/api/home.service';
import { AddressSelectorComponent } from '../../../../shared/component/address-selector/address-selector.component';
import { IAddress } from '../../../../shared/interface/vn-public-apis.interface';
import { addressAsyncValidator } from '../../../../shared/component/validators/address-async.validator';
import { CoordinateSelectorComponent } from '../../../../shared/component/coordinate-selector/coordinate-selector.component';
import { ICoordinate } from '../../../../shared/interface/coordinate.interface';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-home-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    AddressSelectorComponent,
    CoordinateSelectorComponent,

    MaterialModule
  ],
  templateUrl: './home-edit.component.html',
  styleUrl: './home-edit.component.scss'
})
export class HomeEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('formElement') formElements!: QueryList<ElementRef>;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cdRef = inject(ChangeDetectorRef);

  private readonly homeService = inject(HomeService);
  supplier?: TSupplierModel;

  formGroup!: FormGroup;

  private readonly bIsFormChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFormChanged$: Observable<boolean> = this.bIsFormChanged.asObservable();

  private readonly addressValidSubject = new BehaviorSubject<boolean>(false);
  private readonly addressValid$ = this.addressValidSubject.asObservable();
  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.subscription.add(
      this.activatedRoute.queryParamMap.pipe(
        map(params => {
          const supplierId = params.get('_id');
          const elementFocus = params.get('elementFocus');

          return { supplierId, elementFocus };
        }),
        switchMap(res => {
          if (res.supplierId) {
            return this.homeService.getDetail(res.supplierId).pipe(
              map(supplier => ({ elementFocus: res.elementFocus, supplier }))
            )
          }
          return of(null);
        })
      ).subscribe({
        next: (res) => {
          if (res) {
            const elementFocus = res.elementFocus;
            this.supplier = res?.supplier;

            if (elementFocus) {
              setTimeout(() => {
                this.findAndFocusElement(elementFocus)
              }, 150);
            }
          }
          this.initForm();
        },
        error: error => {
          this.goBackSupplierDetail();
        }
      })
    )
  }

  private initForm() {
    const positionGroup = this.formBuilder.group({
      lat: [this.supplier?.position?.lat || '0'],
      lng: [this.supplier?.position?.lng || '0']
    })

    this.formGroup = this.formBuilder.group({
      name: [this.supplier?.name, Validators.required],
      address: [
        this.supplier?.address,
        Validators.required,
        addressAsyncValidator(this.addressValid$)
      ],
      telephone: [this.supplier?.telephone, Validators.required],
      email: [this.supplier?.email],
      position: positionGroup
    });

    const initialFormValue = this.formGroup.getRawValue();
    console.log(initialFormValue);
    
    this.subscription.add(
      this.formGroup.valueChanges.pipe(
        distinctUntilChanged((prev, curr) => {
          return isEqual(prev, curr);
        }),
        skipWhile(value => !isEqual(initialFormValue, value)), // Bỏ qua cho đến khi isEqual = true
      ).subscribe(value => {
        console.log(value);
        const isFormChanged = !isEqual(initialFormValue, value);
        console.log(isFormChanged);
        
        this.bIsFormChanged.next(isFormChanged);
        // console.log(initialFormValue);
        // console.log(isEqual(initialFormValue, value));
      })
    )

    this.cdRef.detectChanges();
  }

  get addressControl() {
    return this.formGroup.get('address') as FormGroup;
  }

  get positionControl() {
    return this.formGroup.get('position') as FormGroup;
  }

  onAddressValueChange(value: IAddress) {
    this.addressControl.patchValue(value);
  }

  onAddressValidChange(isValid: boolean) {
    this.addressValidSubject.next(isValid);
  }

  onCoordinateChange(value: ICoordinate) {
    this.positionControl.patchValue(value);
  }

  private findAndFocusElement(elementFocus: string) {
    const elementToFocus = this.formElements.find(el => el.nativeElement.getAttribute('formcontrolname') === elementFocus);
    if (elementToFocus) {
      elementToFocus.nativeElement.focus();
    }
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      return;
    }
    const api$ = this.supplier?._id ? this.update() : this.create();
    this.subscription.add(
      api$.subscribe({
        next: res => {
          this.goBackSupplierDetail();
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  private create() {
    return this.homeService.create(this.formGroup.value);
  }

  private update() {
    const changedControls: { [key: string]: any } = {};
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      if (control?.dirty) {
        changedControls[key] = control.value;
      }
    });
    return this.homeService.update(this.supplier?._id!, changedControls);
  }

  goBackSupplierDetail() {
    const commands = this.supplier?._id ? ['/supplier/home', this.supplier?._id] : ['/supplier'];
    this.router.navigate(commands);
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
