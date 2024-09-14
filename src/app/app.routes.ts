import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./component/dashboard/dashboard.routes').then(m => m.routes)
  },
];
