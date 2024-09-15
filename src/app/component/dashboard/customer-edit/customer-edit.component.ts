import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, Subscription, switchMap } from 'rxjs';
import { CustomerService } from '../../../shared/service/api/customer.service';
import { TCustomerModel } from '../../../shared/interface/customer.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/module/material';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MaterialModule
  ],
  templateUrl: './customer-edit.component.html',
  styleUrl: './customer-edit.component.scss'
})
export class CustomerEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('formElement') formElements!: QueryList<ElementRef>;
  customerId: string | null = null;
  customer?: TCustomerModel;

  formGroup!: FormGroup;

  afterViewInit: Subject<null> = new Subject<null>();
  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private customerService: CustomerService
  ) { }

  ngOnInit() {
    this.customerId = this.activatedRoute.snapshot.paramMap.get('id');
    if (!this.customerId) {
      this.initForm();
    }
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      name: [this.customer?.name, Validators.required],
      phoneNumber: [this.customer?.phoneNumber, Validators.required],
      address: [this.customer?.address],
      email: [this.customer?.email],
      dob: [this.customer?.dob],
      company: [this.customer?.company],
      note: [this.customer?.note],
      level: [this.customer?.level]
    });
  }

  ngAfterViewInit() {
    if (this.customerId) {
      combineLatest([this.activatedRoute.queryParams, this.customerService.getDetail(this.customerId)]).pipe(
      ).subscribe({
        next: ([params, res]) => {
          if (params && res) {
            const elementFocus = params['elementFocus'];
            this.customer = res;
            
            this.initForm();
            setTimeout(() => {
              this.findAndFocusElement(elementFocus)
            }, 150);
          }
        },
        error: error => {
          this.goBackAlbumDetail();
        }
      });
    }
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
    this.subscription.add(
      this.customerService.update(this.customerId!, this.formGroup.value).subscribe({
        next: res => {
          this.goBackAlbumDetail();
        },
        error: error => {
          console.error(error);
        }
      })
    )
  }

  goBackAlbumDetail() {
    this.router.navigate(['/customer', this.customer?._id]);
  };

  ngOnDestroy() {
  }

}
