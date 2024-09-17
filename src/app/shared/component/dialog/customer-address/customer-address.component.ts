import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../module/material';

@Component({
  selector: 'app-customer-address',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MaterialModule
  ],
  templateUrl: './customer-address.component.html',
  styleUrl: './customer-address.component.scss'
})
export class CustomerAddressComponent {
  readonly dialogRef = inject(MatDialogRef<CustomerAddressComponent>);
  readonly data = inject<string>(MAT_DIALOG_DATA);

  deliveryAddressControl = new FormControl(this.data, Validators.required);
  constructor() {}
}
