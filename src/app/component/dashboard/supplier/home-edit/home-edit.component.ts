import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MaterialModule } from '../../../../shared/module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TSupplierModel } from '../shared/interface/supplier.interface';
import { map, of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../shared/service/api/home.service';
import { AddressSelectorComponent } from '../../../../shared/component/address-selector/address-selector.component';

@Component({
  selector: 'app-home-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    AddressSelectorComponent,

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

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {

  }

  private initForm() {
    const positionGroup = this.formBuilder.group({
      lat: [this.supplier?.position?.lat],
      lng: [this.supplier?.position?.lng]
    })

    this.formGroup = this.formBuilder.group({
      name: [this.supplier?.name, Validators.required],
      address: [this.supplier?.address, Validators.required],
      telephone: [this.supplier?.telephone, Validators.required],
      email: [this.supplier?.email],
      position: [positionGroup, Validators.required],
    });

    this.cdRef.detectChanges();
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

  private findAndFocusElement(elementFocus: string) {
    const elementToFocus = this.formElements.find(el => el.nativeElement.getAttribute('formcontrolname') === elementFocus);
    if (elementToFocus) {
      elementToFocus.nativeElement.focus();
    }
  }

  isFormChanged(): boolean {
    return this.formGroup.dirty && !this.formGroup.pristine;
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
    const commands = this.supplier?._id ? ['/supplier', this.supplier?._id] : ['/supplier'];
    this.router.navigate(commands);
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
