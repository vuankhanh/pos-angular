import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { NgxScannerQrcodeComponent, NgxScannerQrcodeModule, ScannerQRCodeConfig, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { filter, map, Subscription, take, tap } from 'rxjs';
import { Qr } from '../../../utitl/qr-code.util';
import { IBaseBankPayment } from '../../../interface/bank-payment.interface';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../module/material';

@Component({
  selector: 'app-qrcode-scanner',
  standalone: true,
  imports: [
    NgxScannerQrcodeModule,

    MaterialModule
  ],
  templateUrl: './qrcode-scanner.component.html',
  styleUrl: './qrcode-scanner.component.scss'
})
export class QrcodeScannerComponent implements AfterViewInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<QrcodeScannerComponent>);

  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  config: ScannerQRCodeConfig = {
    // constraints: {
    //   video: {
    //     width: window.innerWidth,
    //     height: 800
    //   }
    // }
  };

  private readonly subscription = new Subscription();
  ngAfterViewInit(): void {
    this.scanner.start();

    this.scanner.event.asObservable().pipe(
      map(result=>{
        for(let i = 0; i < result.length; i++){
          const item = result[i];

          const value = item.value;
          const decoded = Qr.decoder(value);
          const isValid = Qr.validateQrCode(decoded);
          console.log(isValid);
          
          if(isValid) return decoded;
        }

        return;
      }),
      filter(result=> !!result),
      tap(()=>this.scanner.stop),
    ).subscribe(result => {
      console.log(result);
      this.dialogRef.close(result);
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.scanner.isStart) {
      this.scanner.stop();
    }
  }
}
