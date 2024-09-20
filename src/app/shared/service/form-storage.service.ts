import { Injectable } from '@angular/core';
import { STORAGE_FORM_CONSTANT } from '../../constant/storage-form.constant';

@Injectable({
  providedIn: 'root'
})
export class FormStorageService {

  constructor() { }

  saveFormData(key: TStorageFormKey, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getFormData(key: TStorageFormKey): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.clearFormData(key);
      return null;
    }
  }

  clearFormData(key: TStorageFormKey): void {
    localStorage.removeItem(key);
  }
}
STORAGE_FORM_CONSTANT

export type TStorageFormKey = typeof STORAGE_FORM_CONSTANT[keyof typeof STORAGE_FORM_CONSTANT];