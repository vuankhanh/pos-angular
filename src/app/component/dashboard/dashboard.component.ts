import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../shared/module/material';
import { Observable, Subscription } from 'rxjs';
import { BreakpointDetectionService } from '../../shared/service/breakpoint-detection.service';
import { RouterEventService } from '../../shared/service/router-event.service';
import { AuthStateService } from '../../shared/service/auth_state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    MaterialModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly router: Router = inject(Router);
  private readonly breakpointDetectionService: BreakpointDetectionService = inject(BreakpointDetectionService);
  private readonly authStateService: AuthStateService = inject(AuthStateService);
  private readonly routerEventService: RouterEventService = inject(RouterEventService);

  breakpointDetection$: Observable<boolean> = this.breakpointDetectionService.detection$();
  menu = [
    { name: 'Album', route: 'album' },
    { name: 'Khách hàng', route: 'customer' },
    { name: 'Sản phẩm', route: 'product' },
    { name: 'Đơn hàng', route: 'order' },
    { name: 'Đơn hàng mua', route: 'purchase-order' },
    {
      name: 'Nhà cung cấp',
      route: 'supplier',
      childs: [
        { name: 'Nhà cung cấp', route: 'location' },
        { name: 'Sản phẩm', route: 'product' },
      ]
    }
  ];

  title$ = this.routerEventService.getRouteTitle$();

  isActiveMap: { [key: string]: boolean } = {};

  private readonly subscription = new Subscription();

  ngOnInit() {
    this.updateActiveRoutes();
  }

  private updateActiveRoutes(): void {
    const currentUrl = this.router.url;
    this.menu.forEach(nav => {
      this.isActiveMap[nav.route] = currentUrl.includes(nav.route);
    });
  }

  logout() {
    this.authStateService.logout();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
