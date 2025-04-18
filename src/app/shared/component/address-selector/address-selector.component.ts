import { AfterViewInit, Component, ElementRef, forwardRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../module/material';
import { VnPublicService } from '../../service/api/vn-public.service';
import { BehaviorSubject, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { IProvince } from '../../interface/vn-public-apis.interface';
import { MatSelectChange } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
export class AddressSelectorComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('provinceEl') provinceEl!: ElementRef<MatInput>;
  @ViewChild('districtEl') districtEl!: ElementRef<MatInput>;
  @ViewChild('wardEl') wardEl!: ElementRef<MatInput>;
  @ViewChild('streetEl') streetEl!: ElementRef<MatInput>;

  private readonly renderer = inject(Renderer2)
  private readonly fb = inject(FormBuilder);
  private readonly vnPublicService = inject(VnPublicService);
  addressForm: FormGroup;
  provinces$: Observable<IProvince[]> = of([]);
  districts$: Observable<IProvince[]> = of([]);
  wards$: Observable<IProvince[]> = of([]);

  bProvinceInputChange = new BehaviorSubject<string>('');
  bDistrictInputChange = new BehaviorSubject<string>('');
  bWardInputChange = new BehaviorSubject<string>('');

  private subscription: Subscription = new Subscription();
  constructor() {
    this.addressForm = this.fb.group({
      province: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      street: [''],
    });

    this.subscription.add(
      this.addressForm.valueChanges.subscribe(value => {
        this.onChange(value);
      })
    )
  }

  get provinceControl() {
    return this.addressForm.get('province')!;
  }

  get districtControl() {
    return this.addressForm.get('district')!;
  }

  get wardControl() {
    return this.addressForm.get('ward')!;
  }

  get streetControl() {
    return this.addressForm.get('street');
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

  onProvinceOptionSelected(event: MatAutocompleteSelectedEvent) {
    const province: IProvince = event.option.value;
    this.provinceEl.nativeElement.value = province.name;
    this.districtEl.nativeElement.value = null;
    this.wardEl.nativeElement.value = null;

    this.provinceControl.setValue(province);
    this.setDistrict$(province.code);
    this.districtControl.setValue(null);
    this.wardControl.setValue(null);
  }

  onDistrictOptionSelected(event: MatAutocompleteSelectedEvent) {
    const district: IProvince = event.option.value;
    this.districtEl.nativeElement.value = district.name;
    this.wardEl.nativeElement.value = null;

    this.districtControl.setValue(district);
    this.setWard$(district.code);
    this.wardControl.setValue(null);
  }

  onWardOptionSelected(event: MatAutocompleteSelectedEvent) {
    const ward: IProvince = event.option.value;
    this.wardEl.nativeElement.value = ward.name;

    this.wardControl.setValue(ward);
  }

  private setProvince$() {
    this.provinces$ = this.vnPublicService.getProvinces().pipe(
      switchMap((provinces: IProvince[]) => this.bProvinceInputChange.pipe(
        startWith(''),
        map((value: string) => {
          const filterValue = value.toLowerCase();
          return provinces.filter((province: IProvince) => province.name.toLowerCase().includes(filterValue));
        })
      ))
    );
  }

  private setDistrict$(provinceCode: string) {
    this.districts$ = this.vnPublicService.getDistricts(provinceCode).pipe(
      switchMap((districts: IProvince[]) => this.bDistrictInputChange.pipe(
        startWith(''),
        map((value: string) => {
          const filterValue = value.toLowerCase();
          return districts.filter((district: IProvince) => district.name.toLowerCase().includes(filterValue));
        })
      ))
    );
  }

  private setWard$(districtCode: string) {
    this.wards$ = this.vnPublicService.getWards(districtCode).pipe(
      switchMap((wards: IProvince[]) => this.bWardInputChange.pipe(
        startWith(''),
        map((value: string) => {
          const filterValue = value.toLowerCase();
          return wards.filter((ward: IProvince) => ward.name.toLowerCase().includes(filterValue));
        })
      ))
    );
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.provinceEl.nativeElement, 'input', (event: InputEvent ) => {
      this.bProvinceInputChange.next(this.provinceEl.nativeElement.value);

      this.provinceControl.setValue(null);
      this.districtControl.setValue(null);
      this.wardControl.setValue(null);
    });
  
    this.renderer.listen(this.districtEl.nativeElement, 'input', () => {
      this.bDistrictInputChange.next(this.districtEl.nativeElement.value);

      this.districtControl.setValue(null);
      this.wardControl.setValue(null);
    });
  
    this.renderer.listen(this.wardEl.nativeElement, 'input', () => {
      this.bWardInputChange.next(this.wardEl.nativeElement.value);
      this.wardControl.setValue(null);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
