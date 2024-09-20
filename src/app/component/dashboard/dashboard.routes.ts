import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { AlbumComponent } from "./album/album.component";
import { AlbumDetailComponent } from "./album-detail/album-detail.component";
import { AlbumEditComponent } from "./album-edit/album-edit.component";
import { CustomerComponent } from "./customer/customer.component";
import { CustomerDetailComponent } from "./customer-detail/customer-detail.component";
import { CustomerEditComponent } from "./customer-edit/customer-edit.component";
import { ProductComponent } from "./product/product.component";
import { ProductDetailComponent } from "./product-detail/product-detail.component";
import { ProductEditComponent } from "./product-edit/product-edit.component";
import { OrderComponent } from "./order/order.component";
import { OrderDetailComponent } from "./order-detail/order-detail.component";
import { OrderEditComponent } from "./order-edit/order-edit.component";

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
        path: 'album-edit',
        component: AlbumEditComponent
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
        path: 'customer-edit',
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
      },
      {
        path: 'product-edit',
        component: ProductEditComponent
      },
      {
        path: 'order',
        title: 'Đơn hàng',
        component: OrderComponent
      },
      {
        path: 'order/:id',
        title: 'Đơn hàng',
        component: OrderDetailComponent
      },
      {
        path: 'order-edit',
        component: OrderEditComponent
      }
    ]
  }
];