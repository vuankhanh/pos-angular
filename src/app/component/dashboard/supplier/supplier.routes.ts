import { Routes } from "@angular/router";
import { SupplierComponent } from "./supplier.component";
import { SupplierProductComponent } from "./supplier-product/supplier-product.component";
import { HomeComponent } from "./home/home.component";
import { HomeDetailComponent } from "./home-detail/home-detail.component";
import { HomeEditComponent } from "./home-edit/home-edit.component";
import { SupplierProductDetailComponent } from "./supplier-product-detail/supplier-product-detail.component";
import { SupplierProductEditComponent } from "./supplier-product-edit/supplier-product-edit.component";

export const routes: Routes = [
  {
    path: '',
    component: SupplierComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'home/:id',
        component: HomeDetailComponent
      },
      {
        path: 'home-edit',
        component: HomeEditComponent
      },
      {
        path: 'product',
        component: SupplierProductComponent
      },
      {
        path: 'product/:id',
        component: SupplierProductDetailComponent
      },
      {
        path: 'product-edit',
        component: SupplierProductEditComponent
      }
    ]
  }
];