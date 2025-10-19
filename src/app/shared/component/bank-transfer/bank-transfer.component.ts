import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../module/material';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { IBank } from '../../interface/bank-transfer.interface';
import { distinctUntilChanged, filter, Subscription, take } from 'rxjs';
import { BankSelectorComponent } from '../bank-selector/bank-selector.component';
import { isEqual } from 'lodash';
import { IBankPayment } from '../../interface/bank-payment.interface';
import { MyDialogService } from '../../service/my-dialog.service';

@Component({
  selector: 'app-bank-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  templateUrl: './bank-transfer.component.html',
  styleUrl: './bank-transfer.component.scss'
})
export class BankTransferComponent implements OnInit, OnDestroy {
  private readonly myDialogService = inject(MyDialogService);
  private readonly formBuilder = inject(FormBuilder);

  @Input() bankTransfer?: IBankPayment;
  @Output() bankTransferChange = new EventEmitter<IBankPayment>();

  bankTransferForm: FormGroup = this.formBuilder.group({
    bankBin: ['', Validators.required],
    bankAvatar: ['', Validators.required],
    bankShortName: ['', Validators.required],
    bankName: ['', Validators.required],
    accountNumber: ['', Validators.required],
    accountName: [''],
  });

  private readonly subscription = new Subscription();

  ngOnInit(): void {
    this.bankTransferForm.patchValue({
      bankBin: this.bankTransfer?.bankBin,
      bankAvatar: this.bankTransfer?.bankAvatar ?? 'assets/svg/house-with-dollar-sign-svgrepo-com.svg',
      bankShortName: this.bankTransfer?.bankShortName ?? 'Chọn ngân hàng',
      bankName: this.bankTransfer?.bankName,
      accountNumber: this.bankTransfer?.accountNumber,
      accountName: this.bankTransfer?.accountName
    });

    this.subscription.add(
      this.bankTransferForm.valueChanges.pipe(
        distinctUntilChanged((prev, curr) => {
          return isEqual(prev, curr)
        })
      ).subscribe(value => {
        this.bankTransferChange.emit(value);
      })
    )
  }

  selectBank() {
    this.subscription.add(
      this.myDialogService.open(BankSelectorComponent, {
        panelClass: 'bank-selector-dialog'
      }).afterClosed().pipe(
        take(1),
        filter(result => !!result)
      ).subscribe((bank: IBank) => {
        this.bankTransferForm.get('bankBin')?.setValue(bank.bin);
        this.bankTransferForm.get('bankAvatar')?.setValue(bank.logo);
        this.bankTransferForm.get('bankShortName')?.setValue(bank.shortName);
        this.bankTransferForm.get('bankName')?.setValue(bank.name);
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
