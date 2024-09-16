import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, of, Subject, Subscription, switchMap } from 'rxjs';
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

  ngOnInit() {}

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
    this.subscription.add(
      this.activatedRoute.queryParamMap.pipe(
        map(params =>{
          const customerId = params.get('_id');
          const elementFocus = params.get('elementFocus');
  
          return {customerId, elementFocus};
        }),
        switchMap(res => {
          if(res.customerId) {
            return this.customerService.getDetail(res.customerId).pipe(
              map(customer => ({elementFocus: res.elementFocus, customer}))
            )
          }
          return of(null);
        })
      ).subscribe({
        next: (res) => {
          if(res){
            const elementFocus = res.elementFocus;
            this.customer = res?.customer;
            
            if(elementFocus) {
              setTimeout(() => {
                this.findAndFocusElement(elementFocus)
              }, 150);
            }
          }
          this.initForm();
        },
        error: error => {
          this.goBackAlbumDetail();
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
    const commands = this.customer?._id ? ['/customer', this.customer?._id] : ['/customer'];
    this.router.navigate(commands);
  };

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
