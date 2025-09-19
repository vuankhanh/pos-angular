import { CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from '../../interface/can-component-deactivate.interface';

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
