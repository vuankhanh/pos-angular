import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { NgxScannerQrcodeComponent, NgxScannerQrcodeModule, ScannerQRCodeConfig, ScannerQRCodeDevice, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
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
    constraints: {
      video: {
        width: window.innerWidth,
        height: 600
      }
    }
  };

  private readonly subscription = new Subscription();
  ngAfterViewInit(): void {
    this.scanner.start(this.playDeviceFacingBack);

    this.scanner.event.asObservable().pipe(
      map(result => {
        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          const value = item.value;
          const decoded = Qr.decoder(value);
          const isValid = Qr.validateQrCode(decoded);

          if (isValid) return decoded;
        }

        return;
      }),
      filter(result => !!result),
      tap(() => this.scanner.stop),
    ).subscribe(result => {
      this.dialogRef.close(result);
    })
  }

  private playDeviceFacingBack = (devices: ScannerQRCodeDevice[]) => {
    // Tìm camera sau
    const device = devices.find(
      (f) => {
        console.log(f);
        return /back|rear|environment/gi.test(f.label);
      }
    );

    if (device) {
      // Nếu tìm thấy, sử dụng camera sau
      this.scanner.playDevice(device.deviceId);
    } else if (devices.length > 0) {
      // Nếu không tìm thấy camera sau rõ ràng, có thể sử dụng camera đầu tiên
      this.scanner.playDevice(devices[0].deviceId);
    } else {
      console.error("No camera devices found.");
    }
  };

  toggleFlash() {
    this.scanner.torcher();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.scanner.isStart) {
      this.scanner.stop();
    }
  }
}
