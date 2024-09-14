import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Pipe({
  name: 'baseUrl',
  standalone: true
})
export class SetBaseUrlPipe implements PipeTransform {
  private backend: string = environment.backendStatic;
  transform(url: string): string {
    return this.backend + '/'+ url;
  }

}
