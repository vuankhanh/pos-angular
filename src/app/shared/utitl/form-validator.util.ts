import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function filesArrayValidator(control: AbstractControl): ValidationErrors | null {
  const files = control.value;
  if (Array.isArray(files) && files.length > 0 && files.every(file => file instanceof File)) {
    return null; // Valid
  }
  return { filesArrayInvalid: true }; // Invalid
}

export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isNotNumber = typeof control.value !== 'number';
    return isNotNumber ? { 'notNumber': { value: control.value } } : null;
  };
}