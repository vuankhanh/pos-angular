import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { AlbumComponent } from "./album/album.component";
import { AlbumDetailComponent } from "./album-detail/album-detail.component";


export const routes: Routes = [
  {
    path: '',
    title: 'Dashboard',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'album',
        pathMatch: 'full'
      },
      {
        path: 'album',
        title: 'Album',
        component: AlbumComponent
      },
      {
        path: 'album/:route',
        title: 'Album',
        component: AlbumDetailComponent
      }
    ]
  }
];