import { Component, forwardRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../module/material';
import { VnPublicService } from '../../service/api/vn-public.service';
import { Observable, of, Subscription } from 'rxjs';
import { IProvince } from '../../interface/vn-public-apis.interface';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-address-selector',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressSelectorComponent),
      multi: true,
    },
  ],
  templateUrl: './address-selector.component.html',
  styleUrl: './address-selector.component.scss'
})
export class AddressSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private readonly vnPublicService = inject(VnPublicService);
  addressForm: FormGroup;
  provinces$: Observable<IProvince[]> = of([]);
  districts$: Observable<IProvince[]> = of([]);
  wards$: Observable<IProvince[]> = of([]);

  subscription: Subscription = new Subscription();
  constructor(
    private fb: FormBuilder
  ) {
    this.addressForm = this.fb.group({
      province: [''],
      district: [''],
      ward: [''],
      street: [''],
    });

    this.addressForm.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    if (value) {
      this.addressForm.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.addressForm.disable();
    } else {
      this.addressForm.enable();
    }
  }

  ngOnInit(): void {
    this.setProvince$();
  }

  onProvinceChange(event: MatSelectChange) {
    const province: IProvince = event.value;
    console.log(province);
    this.setDistrict$(province.code);
  }

  onDistrictChange(event: MatSelectChange) {
    const district: IProvince = event.value;
    console.log(district);
    this.setWard$(district.code);
  }

  onWardChange(event: MatSelectChange) {
    const ward: IProvince = event.value;
    console.log(ward);
  }

  private setProvince$() {
    this.provinces$ = this.vnPublicService.getProvinces();
  }

  private setDistrict$(provinceCode: string) {
    this.districts$ = this.vnPublicService.getDistricts(provinceCode);
  }

  private setWard$(districtCode: string) {
    this.wards$ = this.vnPublicService.getWards(districtCode);
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
