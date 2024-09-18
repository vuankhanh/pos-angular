import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { TOrderDetailModel } from '../../../shared/interface/order.interface';
import { BreakpointDetectionService } from '../../../shared/service/breakpoint-detection.service';
import { SetBaseUrlPipe } from '../../../shared/pipe/set-base-url.pipe';
import { NumberInputComponent } from '../../../shared/component/number-input/number-input.component';
import { CurrencyCustomPipe } from '../../../shared/pipe/currency-custom.pipe';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,

    MaterialModule,

    SetBaseUrlPipe,
    CurrencyCustomPipe
  ],
  providers: [
    CurrencyCustomPipe
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  order?: TOrderDetailModel;
  displayedColumns = ['thumbnail', 'name', 'quantity', 'price', 'total'];

  breakpointDetection$ = this.breakpointDetectionService.detection$();
  constructor(
    private readonly breakpointDetectionService: BreakpointDetectionService
  ) { }

}
