import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../shared/module/material';
import { Observable, of } from 'rxjs';
import { BreakpointDetectionService } from '../../shared/service/breakpoint-detection.service';
import { AuthStateService } from '../../shared/service/auth_state.service';
import { RouterEventService } from '../../shared/service/router-event.service';

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
export class DashboardComponent {
  breakpointDetection$: Observable<boolean> = of(false);
  menu = [
    { name: 'Album', route: 'album' },
  ]

  title$ = this.routerEventService.getRouteTitle$();
  constructor(
    private breakpointDetectionService: BreakpointDetectionService,
    private authStateService: AuthStateService,
    private routerEventService: RouterEventService,
  ) {
    this.breakpointDetection$ = this.breakpointDetectionService.detection$()
  }

  logout() {
    this.authStateService.logout();
  }
}
