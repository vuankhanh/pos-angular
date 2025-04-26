import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../shared/module/material';
import { Observable, of } from 'rxjs';
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
export class DashboardComponent implements OnInit {
  breakpointDetection$: Observable<boolean> = of(false);
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

  constructor(
    private router: Router,
    private breakpointDetectionService: BreakpointDetectionService,
    private authStateService: AuthStateService,
    private routerEventService: RouterEventService,
  ) {
    this.breakpointDetection$ = this.breakpointDetectionService.detection$()
  }

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
}
