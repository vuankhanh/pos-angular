import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IConfirmDialog, TConfirmDialogData } from '../../../interface/confirm_dialog.interface';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent implements IConfirmDialog {
  data: TConfirmDialogData = inject(MAT_DIALOG_DATA);
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmComponent>,
  ) { }

  confirmAction() {
    this.dialogRef.close(true);
  };

  cancelAction() {
    this.dialogRef.close();
  };
}
