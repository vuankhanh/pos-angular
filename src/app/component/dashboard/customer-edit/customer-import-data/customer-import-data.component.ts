import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { CustomerService } from '../../../../shared/service/api/customer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-import-data',
  standalone: true,
  imports: [
    CommonModule,

    MatDialogModule,
    NgxFileDropModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './customer-import-data.component.html',
  styleUrl: './customer-import-data.component.scss'
})
export class CustomerImportDataComponent {
  readonly dialogRef =  inject(MatDialogRef<CustomerImportDataComponent>);

  accept = 'text/csv';
  isMultiple = false;

  file: File | null = null;

  subscription: Subscription = new Subscription();
  constructor(
    private readonly customerService: CustomerService,
  ){}
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
      console.log(this.file);
      
    } else {
      alert('Mục được thả vào không phải là file');
    }
  }

  edit(){
    this.file = null;
  }

  upload(){
    this.subscription.add(
      this.customerService.importFile(this.file as Blob).subscribe(res=>{
        this.dialogRef.close(true);
      })
    )
  }

  private cbToPromise(dropFile: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
      dropFile.file((file: File) => {
        resolve(file);
      }, (error: Error)=>{
        reject(error);
      })
    })
  }
}
