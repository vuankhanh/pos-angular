import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ISupplierDebt, TSupplierLocationModel } from '../../../../component/dashboard/supplier/shared/interface/supplier-location.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { BehaviorSubject, map, Observable, Subscription, switchMap, filter } from 'rxjs';
import { LocationService } from '../../../../component/dashboard/supplier/shared/service/api/location.service';

@Component({
  selector: 'app-update-supplier-debt',
  standalone: true,
  imports: [
    CommonModule,

    ReactiveFormsModule,

    MaterialModule,

    NgxMaskDirective
  ],
  providers: [provideNgxMask()],
  templateUrl: './update-supplier-debt.component.html',
  styleUrl: './update-supplier-debt.component.scss'
})
export class UpdateSupplierDebtComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<UpdateSupplierDebtComponent>);
  data: TSupplierLocationModel = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private readonly locationService = inject(LocationService);

  formGroup!: FormGroup;

  private readonly bControlFormChanged: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject<{ [key: string]: any }>({});
  private readonly controlFormChanged$: Observable<{ [key: string]: any }> = this.bControlFormChanged.asObservable();
  isFormChanged$: Observable<boolean> = this.controlFormChanged$.pipe(
    map((value: { [key: string]: any }) => {
      return Object.keys(value).length > 0;
    }),
  );

  private readonly subscription = new Subscription;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      amount: [this.data?.debt?.amount || 0],
      note: [this.data?.debt?.note || '']
    });

    const rawDebt: ISupplierDebt = this.data.debt || {
      amount: 0,
      note: ''
    };

    this.subscription.add(
      this.formGroup.valueChanges.subscribe((value) => {
        //Lấy ra các control đã thay đổi
        const changedControls: { [key: string]: any } = {};
        Object.keys(value).forEach(key => {
          if (!rawDebt) return;
          if ((value[key] !== rawDebt[key as keyof ISupplierDebt])) {
            changedControls[key] = value[key];
          }
        });
 
        this.bControlFormChanged.next(changedControls);
      })
    )
  }

  onAmountBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value === '') {
      this.formGroup.patchValue({ amount: 0 });
    }
  }

  updateDebt() {
    this.subscription.add(
      this.isFormChanged$.pipe(
        filter(value=> !!value),
        switchMap(_ => this.locationService.updateDebt(this.data._id, this.formGroup.value))
      ).subscribe(res=>{
        this.dialogRef.close(res);
      })

    )
  };

  clearDebt() {
    this.subscription.add(
      this.locationService.clearDebt(this.data._id).subscribe(res=>{
        console.log(res);
        this.dialogRef.close(res);
      })
    )
  }

  cancelAction() {
    this.dialogRef.close();
  };

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
