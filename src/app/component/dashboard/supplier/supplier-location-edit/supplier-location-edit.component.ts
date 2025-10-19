import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MaterialModule } from '../../../../shared/module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TSupplierLocationModel } from '../shared/interface/supplier-location.interface';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, skipUntil, skipWhile, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../shared/service/api/location.service';
import { AddressSelectorComponent } from '../../../../shared/component/address-selector/address-selector.component';
import { IAddress } from '../../../../shared/interface/vn-public-apis.interface';
import { addressAsyncValidator } from '../../../../shared/component/validators/address-async.validator';
import { CoordinateSelectorComponent } from '../../../../shared/component/coordinate-selector/coordinate-selector.component';
import { ICoordinate } from '../../../../shared/interface/coordinate.interface';
import { isEqual } from 'lodash';
import { BankTransferComponent } from '../../../../shared/component/bank-transfer/bank-transfer.component';
import { IBankPayment } from '../../../../shared/interface/bank-payment.interface';

@Component({
  selector: 'app-supplier-location-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    AddressSelectorComponent,
    CoordinateSelectorComponent,
    BankTransferComponent,

    MaterialModule
  ],
  templateUrl: './supplier-location-edit.component.html',
  styleUrl: './supplier-location-edit.component.scss'
})
export class SupplierLocationEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('formElement') formElements!: QueryList<ElementRef>;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly cdRef = inject(ChangeDetectorRef);

  private readonly locationService = inject(LocationService);
  supplierLocation?: TSupplierLocationModel;

  formGroup!: FormGroup;

  private readonly bControlFormChanged: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject<{ [key: string]: any }>({});
  private readonly controlFormChanged$: Observable<{ [key: string]: any }> = this.bControlFormChanged.asObservable();
  isFormChanged$: Observable<boolean> = this.controlFormChanged$.pipe(
    map((value: { [key: string]: any }) => {
      return Object.keys(value).length > 0;
    }),
  );

  private readonly addressValidSubject = new BehaviorSubject<boolean>(false);
  private readonly addressValid$ = this.addressValidSubject.asObservable();

  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {

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
            return this.locationService.getDetail(res.supplierLocationId).pipe(
              map(supplierLocation => ({ elementFocus: res.elementFocus, supplierLocation }))
            )
          }
          return of(null);
        })
      ).subscribe({
        next: (res) => {
          if (res) {
            const elementFocus = res.elementFocus;
            this.supplierLocation = res?.supplierLocation;
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
      lat: [this.supplierLocation?.position?.lat || '0'],
      lng: [this.supplierLocation?.position?.lng || '0']
    });

    const bankTransferForm: FormGroup = this.formBuilder.group({
      bankBin: [this.supplierLocation?.bankTransfer?.bankBin, Validators.required],
      bankAvatar: [this.supplierLocation?.bankTransfer?.bankAvatar, Validators.required],
      bankShortName: [this.supplierLocation?.bankTransfer?.bankShortName, Validators.required],
      bankName: [this.supplierLocation?.bankTransfer?.bankName, Validators.required],
      accountNumber: [this.supplierLocation?.bankTransfer?.accountNumber, Validators.required],
      accountName: [this.supplierLocation?.bankTransfer?.accountName],
    });

    this.formGroup = this.formBuilder.group({
      name: [this.supplierLocation?.name, Validators.required],
      address: [
        this.supplierLocation?.address || null,
        Validators.required,
        addressAsyncValidator(this.addressValid$)
      ],
      telephone: [this.supplierLocation?.telephone, Validators.required],
      email: [this.supplierLocation?.email],
      position: positionGroup,
      bankTransfer: bankTransferForm
    });

    const initialFormValue = this.formGroup.getRawValue();

    this.subscription.add(
      this.formGroup.valueChanges.pipe(
        distinctUntilChanged((prev, curr) => {
          return isEqual(prev, curr);
        }),
        skipWhile(value => !isEqual(initialFormValue, value)), // Bỏ qua cho đến khi isEqual = true
      ).subscribe(value => {
        const changedControls: { [key: string]: any } = {};
        Object.keys(value).forEach(key => {
          if (!this.supplierLocation) return;
          // Bỏ qua nếu không thay đổi
          if (!isEqual(value[key], this.supplierLocation[key as keyof TSupplierLocationModel])) {
            changedControls[key] = value[key];
          }
        });
        
        this.bControlFormChanged.next(changedControls);
      })
    );
    this.cdRef.detectChanges();
  }

  get addressControl() {
    return this.formGroup.get('address') as FormGroup;
  }

  get positionControl() {
    return this.formGroup.get('position') as FormGroup;
  }

  get bankTransferControl() {
    return this.formGroup.get('bankTransfer') as FormGroup;
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

  onBankTransferChange(value: IBankPayment) {
    this.bankTransferControl.patchValue(value);
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      return;
    }
    const api$ = this.supplierLocation?._id ? this.update() : this.create();
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
    return this.locationService.create(this.formGroup.value);
  }

  private update() {
    return this.controlFormChanged$.pipe(
      switchMap((value: { [key: string]: any }) => {
        return this.locationService.update(this.supplierLocation?._id!, value);
      })
    )
  }

  goBackSupplierDetail() {
    const commands = this.supplierLocation?._id ? ['/supplier/location', this.supplierLocation?._id] : ['/supplier'];
    this.router.navigate(commands);
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
