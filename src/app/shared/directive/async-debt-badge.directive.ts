import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { LocationService } from '../../component/dashboard/supplier/shared/service/api/location.service';
import { take } from 'rxjs';

@Directive({
  selector: '[asyncDebtBadge]',
  standalone: true
})
export class AsyncDebtBadgeDirective implements OnInit {
  @Input('asyncDebtBadge') supplierId!: string;

  constructor(
    private el: ElementRef,
    private renderer2: Renderer2,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {

    if (!this.supplierId) return;
    this.locationService.getDebtBySupplierId(this.supplierId)
      .pipe(take(1))
      .subscribe(res => {
        if( !res || !res?.debt || res?.debt?.amount === 0) return;

        const element = this.el.nativeElement;
        element.style.display = 'unset'
        element.style.color = res.debt.amount < 0 ? 'green' : 'red';
        element.innerHTML = res.debt.amount < 0 ? 'add_circle' : 'remove_circle';

        const parent = element.parentElement;
        if (parent) {
          this.renderer2.setAttribute(parent, 'debt-amount', res.debt.amount.toString());
          this.renderer2.setAttribute(parent, 'debt-note', res.debt.note);
        }
      });
  }

}
