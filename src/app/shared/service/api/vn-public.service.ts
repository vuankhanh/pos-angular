import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { IProvince, IProvinceResponse } from '../../interface/vn-public-apis.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VnPublicService {
  private readonly httpClient = inject(HttpClient);
  private readonly url: string = environment.backendApi + '/vn-public-apis';

  getProvinces() {
    return this.httpClient.get<IProvinceResponse>(this.url + '/provinces').pipe(
      map(res => res.metaData.data)
    );
  }

  getDistricts(provinceCode: string) {
    return this.httpClient.get<IProvinceResponse>(this.url + '/districts?provinceCode=' + provinceCode).pipe(
      map(res => res.metaData.data)
    );
  }

  getWards(districtCode: string) {
    return this.httpClient.get<IProvinceResponse>(this.url + '/wards?districtCode=' + districtCode).pipe(
      map(res => res.metaData.data)
    );
  }
}
