// filepath: d:\Workspace\Programming\MEAN\Angular\pos-angular\src\app\shared\validators\address-async.validator.ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function addressAsyncValidator(addressValid$: Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return addressValid$.pipe(
      map(isValid => (isValid ? null : { invalidAddress: true }))
    );
  };
}