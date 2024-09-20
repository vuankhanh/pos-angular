import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PresentComponent } from 'src/app/present/present.component';

export type CanDeactivateType = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

export interface DeactivatableComponent {
  canDeactivate: () => CanDeactivateType;
}

export const componentAreDestroyedGuard: CanDeactivateFn<DeactivatableComponent> = (component: DeactivatableComponent) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};