import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { CustomerService } from '../../../../shared/service/api/customer.service';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../../../shared/module/material';

@Component({
  selector: 'app-customer-import-data',
  standalone: true,
  imports: [
    CommonModule,

    NgxFileDropModule,
    MaterialModule
  ],
  templateUrl: './customer-import-data.component.html',
  styleUrl: './customer-import-data.component.scss'
})
export class CustomerImportDataComponent {
  readonly dialogRef = inject(MatDialogRef<CustomerImportDataComponent>);

  accept = 'text/csv';
  isMultiple = false;

  file: File | null = null;

  private readonly subscription: Subscription = new Subscription();
  constructor(
    private readonly customerService: CustomerService,
  ) { }
  public async dropped(files: Array<NgxFileDropEntry>) {
    if (!this.isMultiple && files.length > 1) {
      alert('Chỉ cho phép tải lên 1 file');
      return;
    }
    const droppedFile = files[0];
    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      const file: File = await this.cbToPromise(fileEntry);
      const validType = file.type === this.accept;
      if (!validType) {
        alert('File không đúng định dạng');
        return;
      }
      this.file = file;
    } else {
      alert('Mục được thả vào không phải là file');
    }
  }

  edit() {
    this.file = null;
  }

  upload() {
    this.subscription.add(
      this.customerService.importFile(this.file as Blob).subscribe(res => {
        this.dialogRef.close(true);
      })
    )
  }

  private cbToPromise(dropFile: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
      dropFile.file((file: File) => {
        resolve(file);
      }, (error: Error) => {
        reject(error);
      })
    })
  }
}
