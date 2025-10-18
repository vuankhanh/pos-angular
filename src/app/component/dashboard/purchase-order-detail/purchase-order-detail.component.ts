import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PurchaseOrderItem, TPurchaseOrder } from '../../../shared/interface/purchase-order.interface';
import { BehaviorSubject, defaultIfEmpty, filter, lastValueFrom, map, Observable, Subscription, switchMap, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';

import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/module/material';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';
import { PurchaseOrderService } from '../../../shared/service/api/purchase-order.service';
import { GroupedOrderItems } from '../../../shared/interface/grouped-order-items.interface';
import { PurchaseOrderUtil } from '../../../shared/utitl/purchase-order.util';
import { MatCard } from '@angular/material/card';

import { Html2canvasService } from '../../../shared/service/html2canvas.service';
import { StatusColorComponent } from '../../../shared/component/status-color/status-color.component';
import { AsyncDebtBadgeDirective } from '../../../shared/directive/async-debt-badge.directive';
import { MatMenuTrigger } from '@angular/material/menu';
import { BankTransferService } from '../../../shared/service/api/bank-transfer.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../../shared/component/dialog/confirm/confirm.component';
import { TConfirmDialogData } from '../../../shared/interface/confirm_dialog.interface';
import { ToastrService } from 'ngx-toastr';
import { QrcodeScannerComponent } from '../../../shared/component/dialog/qrcode-scanner/qrcode-scanner.component';
import { IBaseBankPayment } from '../../../shared/interface/bank-payment.interface';
import { QrCodeImageComponent } from '../../../shared/component/dialog/qr-code-image/qr-code-image.component';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [
    CommonModule,

    StatusColorComponent,
    CurrencyCustomPipe,
    AsyncDebtBadgeDirective,

    MaterialModule
  ],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss'
})
export class PurchaseOrderDetailComponent implements OnInit, OnDestroy {
  @ViewChild('matCard', { read: ElementRef }) matCard!: ElementRef<MatCard>;
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly purchaseOrderService: PurchaseOrderService = inject(PurchaseOrderService);
  private readonly html2canvasService = inject(Html2canvasService);
  private readonly bankTransferService = inject(BankTransferService);
  private readonly matDialog = inject(MatDialog);
  private readonly toastService = inject(ToastrService)

  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('menuTrigger', { read: ElementRef }) triggerElementRef!: ElementRef<HTMLDivElement>;

  purchaseOrder?: TPurchaseOrder;

  private readonly bPurchaseOrderItems: BehaviorSubject<PurchaseOrderItem[]> = new BehaviorSubject<PurchaseOrderItem[]>([]);
  purchaseOrderItems$: Observable<PurchaseOrderItem[]> = this.bPurchaseOrderItems.asObservable();
  groupedOrderItems$: Observable<GroupedOrderItems[]> = this.purchaseOrderItems$.pipe(
    map((items) => {
      const grouped = PurchaseOrderUtil.groupBySupplier(items);
      return grouped;
    })
  );

  totalPrice$: Observable<number> = this.purchaseOrderItems$.pipe(
    map((items) => {
      return items.reduce((total, item) => {
        return total + item.itemTotal;
      }, 0);
    })
  );

  breakpointDetection$ = this.breakpointDetectionService.detection$();

  private readonly subscription: Subscription = new Subscription();

  ngOnInit(): void {
    const purchaseOrderDetail$ = this.activatedRoute.params.pipe(
      map(params => {
        const id: string = params['id'] as string;
        return id;
      }),
      switchMap(id => this.purchaseOrderService.getDetail(id))
    );
    this.subscription.add(
      purchaseOrderDetail$.subscribe({
        next: res => {
          // Xử lý purchaseOrderDetail
          this.purchaseOrder = res;
          const purchaseOrderItems: PurchaseOrderItem[] = res.purchaseOrderItems.map(item => {
            return new PurchaseOrderItem({
              product: item.product,
              quantity: item.quantity,
              discount: item.discount || 0
            });
          });
          this.bPurchaseOrderItems.next(purchaseOrderItems);
        },
        error: error => {
          this.goBackOrderList();
        }
      })
    );
  }

  goBackOrderList() {
    this.router.navigate(['/purchase-order']);
  }

  async onDownloadSingle(groupedOrderItem: GroupedOrderItems) {
    const status = this.purchaseOrder!.status;
    const orderCode = this.purchaseOrder!.orderCode;
    const createdAt = this.purchaseOrder!.createdAt;
    try {
      const image = await this.html2canvasService.captureTableFromObject(
        status,
        orderCode,
        groupedOrderItem,
        createdAt,
        800,
        600
      );
      const link = document.createElement('a');
      link.href = image;
      const extension = 'png';
      link.download = [orderCode, extension].join('.');
      link.click();
    } catch (error) {
      console.error('Error capturing table:', error);
    }
  }

  async onDownloadMultiple() {
    const status = this.purchaseOrder!.status;
    const orderCode = this.purchaseOrder!.orderCode;
    const createdAt = this.purchaseOrder!.createdAt;
    try {
      const groupedOrderItems = await lastValueFrom(this.groupedOrderItems$.pipe(take(1)));
      const totalAmount = await lastValueFrom(this.totalPrice$.pipe(take(1)));

      const image = await this.html2canvasService.captureTableFromArray(
        status,
        orderCode,
        totalAmount,
        groupedOrderItems,
        createdAt,
        800,
        600)
      const link = document.createElement('a');
      link.href = image;
      const extension = 'png';
      link.download = [orderCode, extension].join('.');
      link.click();
    } catch (error) {
      console.error('Error capturing table:', error);
    }
  }

  onTotalPriceLongPress(event: MouseEvent, group: GroupedOrderItems) {
    event.preventDefault();
    this.openMenu(event.clientX, event.clientY, group);
  }
  onTotalPriceLongTouch(event: TouchEvent, group: GroupedOrderItems) {
    event.preventDefault();
    this.openMenu(event.touches[0].clientX, event.touches[0].clientY, group);
  }

  onMenuClick(event: MouseEvent, group: GroupedOrderItems) {
    console.log(event);
    
    event.preventDefault();
    event.stopPropagation();
    this.openMenu(event.clientX, event.clientY, group);
  }

  private openMenu(x: number, y: number, group: GroupedOrderItems) {
    this.triggerElementRef.nativeElement.style.display = 'block';
    this.triggerElementRef.nativeElement.style.top = `${y}px`;
    this.triggerElementRef.nativeElement.style.left = `${x}px`;

    this.menuTrigger.menuData = { orderGroup: group };
    this.menuTrigger.openMenu();

    setTimeout(() => {
      this.triggerElementRef.nativeElement.style.display = 'none';
    }, 50);
  }

  async onGenerateQrCode(group: GroupedOrderItems) {
    if (!group.bankTransfer) {
      return;
    }

    const supplier = group.productSupplierName;
    const bankBin = group.bankTransfer.bankBin
    const accountNumber = group.bankTransfer.accountNumber
    const accountName = group.bankTransfer.accountName;
    const amount = group.totalPrice;
    const addInfo = '';
    await this.generateQrCodeAndShare(supplier, bankBin, accountNumber, accountName, amount, addInfo);
  }

  async onScanQrCode(group: GroupedOrderItems) {
    const dialogRef = this.matDialog.open(QrcodeScannerComponent, {
      panelClass: ['responsive-design-dialog', 'qrcode-scanner-dialog']
    });

    const result: IBaseBankPayment = await lastValueFrom(dialogRef.afterClosed().pipe(
      filter(result => !!result),
      defaultIfEmpty(null),
      take(1),
    ));

    if (!result) return;
    
    const supplier = group.productSupplierName;
    const bankBin = result.bankBin;
    const accountNumber = result.accountNumber;
    const accountName = 'something';
    const amount = group.totalPrice;
    const addInfo = '';

    await this.generateQrCodeAndShare(supplier, bankBin, accountNumber, accountName, amount, addInfo);
  }

  private async generateQrCodeAndShare(supplier: string, bankBin: string, accountNumber: string, accountName: string, amount: number, addInfo: string) {
    const blob: Blob = await lastValueFrom(this.bankTransferService.generateQrCode(bankBin, accountNumber, accountName, amount, addInfo));
    this.matDialog.open(QrCodeImageComponent, {
      data: {  supplier: supplier, blob: blob},
      panelClass: ['responsive-design-dialog']
    });
  }

  onEditEvent() {
    this.router.navigate(['/purchase-order-edit'], {
      queryParams: {
        _id: this.purchaseOrder?._id
      }
    });
  }

  onRemoveEvent() {
    if (!this.purchaseOrder) return;

    const data: TConfirmDialogData = {
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa đơn hàng ${this.purchaseOrder.orderCode} không?`,
      cancelText: 'Hủy',
      confirmColor: 'warn',
      confirmText: 'Xóa'
    }
    this.matDialog.open(ConfirmComponent, {
      data
    }).afterClosed().pipe(
      filter(result => result),
      switchMap(() => this.purchaseOrderService.remove(this.purchaseOrder!._id))
    ).subscribe(
      {
        next: res => {
          this.toastService.success('Xoá đơn hàng thành công');
          this.router.navigate(['/purchase-order']);
        },
        error: error => {
          console.error(error);
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
