import { Routes } from '@angular/router';
import { permissionGuard } from './shared/core/guard/permission.guard';
import { LoginComponent } from './component/login/login.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./component/dashboard/dashboard.routes').then(m => m.routes),
    canActivate: [permissionGuard],
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
