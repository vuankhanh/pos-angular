import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../module/material';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BankTransferService } from '../../service/api/bank-transfer.service';
import { map, startWith, switchMap } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { AutoFocusDirective } from '../../directive/auto-focus.directive';
import { IBank } from '../../interface/bank-transfer.interface';

@Component({
  selector: 'app-bank-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    AutoFocusDirective,

    MaterialModule
  ],
  templateUrl: './bank-selector.component.html',
  styleUrl: './bank-selector.component.scss'
})
export class BankSelectorComponent {
  readonly dialogRef = inject(MatDialogRef<BankSelectorComponent>)
  private readonly bankTransferService = inject(BankTransferService);
  
  readonly searchInputControl: FormControl = new FormControl('');
  banks$ = this.bankTransferService.getAll().pipe(
    switchMap((banks: IBank[]) => this.searchInputControl.valueChanges.pipe(
      startWith(''),
      map(value => value ? banks.filter(bank =>
        bank.name.toLowerCase().includes(value.toLowerCase()) ||
        bank.shortName.toLowerCase().includes(value.toLowerCase())
      ) : banks)
    ))
  );
}