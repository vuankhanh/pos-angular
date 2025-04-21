import { Routes } from "@angular/router";
import { SupplierComponent } from "./supplier.component";
import { SupplierLocationComponent } from "./supplier-location/supplier-location.component";
import { SupplierLocationDetailComponent } from "./supplier-location-detail/supplier-location-detail.component";
import { SupplierLocationEditComponent } from "./supplier-location-edit/supplier-location-edit.component";

import { SupplierProductComponent } from "./supplier-product/supplier-product.component";
import { SupplierProductDetailComponent } from "./supplier-product-detail/supplier-product-detail.component";
import { SupplierProductEditComponent } from "./supplier-product-edit/supplier-product-edit.component";

export const routes: Routes = [
  {
    path: '',
    component: SupplierComponent,
    children: [
      {
        path: '',
        redirectTo: 'location',
        pathMatch: 'full'
      },
      {
        path: 'location',
        component: SupplierLocationComponent
      },
      {
        path: 'location/:id',
        component: SupplierLocationDetailComponent
      },
      {
        path: 'location-edit',
        component: SupplierLocationEditComponent
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