import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../module/material';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-qr-code-image',
  standalone: true,
  imports: [
    CommonModule,

    MaterialModule
  ],
  templateUrl: './qr-code-image.component.html',
  styleUrl: './qr-code-image.component.scss'
})
export class QrCodeImageComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<QrCodeImageComponent>)
  readonly data = inject<{ supplier: string, blob: Blob }>(MAT_DIALOG_DATA);
  private readonly toastService = inject(ToastrService)

  private readonly imgQrCode = new BehaviorSubject<string>('');
  readonly imgQrCode$ = this.imgQrCode.asObservable();
  ngOnInit(): void {
    this.createUrl(this.data.blob)
      .then(res => this.imgQrCode.next(res as string))
      .catch(() => {
        this.toastService.error('Có lỗi từ tệp ảnh Qr-Code lấy về');
      })
      .finally(() => console.log('done!'));
  }

  private createUrl(data: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader;

      reader.onload = function () {
        const blobAsDataUrl = reader.result as string;
        resolve(blobAsDataUrl);
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(data);
    })
  }

  async shareQrCode() {
    const qrCodeFile = new File([this.data.blob], 'qrcode_thanh_toan.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [qrCodeFile] })) {
      await navigator.share({
        files: [qrCodeFile],
        title: 'Thanh toán QR Code',
        text: 'Chia sẻ mã QR để thanh toán nhanh'
      });
    };
  }
}
