import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from 'ngx-toastr';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyDialogService {
  private readonly matDialog = inject(MatDialog);

  /**
   * Mở dialog và thêm logic chung vào afterClosed().
   * @param component Component của dialog.
   * @param config Cấu hình MatDialogConfig tùy chọn.
   * @returns MatDialogRef<T, R> với afterClosed() đã được sửa đổi.
  */
  open<T, D = any, R = any>(
    component: ComponentType<T>,
    config?: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    // Lưu trữ trang trên history
    history.pushState({ dialogOpen: true }, '', window.location.href);
    // 1. Mở dialog gốc
    const dialogRef = this.matDialog.open<T, D, R>(component, config);

    // 2. Chèn logic chung vào afterClosed()
    // Lưu trữ afterClosed() gốc
    const originalAfterClosed = dialogRef.afterClosed;

    // Ghi đè phương thức afterClosed()
    dialogRef.afterClosed = () => {
      return originalAfterClosed.call(dialogRef).pipe(
        // Thêm đoạn code/logic chung của bạn vào đây
        tap(result => {
          // --- ĐOẠN CODE CHUNG CỦA BẠN BẮT ĐẦU ---
          if (history.state && history.state.dialogOpen) {
            history.back(); // Go back to the previous state
          }
          // --- ĐOẠN CODE CHUNG CỦA BẠN KẾT THÚC ---
        })
      ) as Observable<R | undefined>;
    };

    return dialogRef;
  }
}
