import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { AlbumComponent } from "./album/album.component";
import { AlbumDetailComponent } from "./album-detail/album-detail.component";
import { CustomerComponent } from "./customer/customer.component";
import { CustomerDetailComponent } from "./customer-detail/customer-detail.component";
import { CustomerEditComponent } from "./customer-edit/customer-edit.component";
import { ProductComponent } from "./product/product.component";
import { ProductDetailComponent } from "./product-detail/product-detail.component";


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
      },
      {
        path: 'customer',
        title: 'Khách hàng',
        component: CustomerComponent
      },
      {
        path: 'customer/:id',
        title: 'Khách hàng',
        component: CustomerDetailComponent
      },
      {
        path: 'customer/edit/:id',
        component: CustomerEditComponent
      },
      {
        path: 'product',
        title: 'Sản phẩm',
        component: ProductComponent
      },
      {
        path: 'product/:id',
        title: 'Sản phẩm',
        component: ProductDetailComponent
      }
    ]
  }
];