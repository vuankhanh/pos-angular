import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../module/material';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { OnlyNumberDirective } from '../../../directive/only-number.directive';
import { CurrencyCustomPipe } from '../../../pipe/currency-custom.pipe';

@Component({
  selector: 'app-fee-discount',
  standalone: true,
  imports: [
    FormsModule,

    MaterialModule,

    OnlyNumberDirective,

    CurrencyCustomPipe
  ],
  providers:[
    CurrencyCustomPipe
  ],
  templateUrl: './fee-discount.component.html',
  styleUrl: './fee-discount.component.scss'
})
export class FeeDiscountComponent {
  constructor(
    public dialogRef: MatDialogRef<FeeDiscountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { label: string, value: number, suffix: 'percentage' | 'currency' }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.value);
  }
}