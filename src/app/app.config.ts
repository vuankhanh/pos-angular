import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SetBaseUrlPipe } from './shared/pipe/set-base-url.pipe';
import { CurrencyCustomPipe } from './shared/pipe/currency-custom.pipe';
import { ShowToastInterceptor } from './shared/core/interceptors/show-toast.interceptor';
import { AuthInterceptor } from './shared/core/interceptors/auth.interceptor';
import { LoadingInterceptor } from './shared/core/interceptors/loading.interceptor';
import { provideToastr, ToastrService } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    { provide: HTTP_INTERCEPTORS, useClass: ShowToastInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    provideToastr({
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
    ToastrService,
    SetBaseUrlPipe,
    CurrencyCustomPipe,
  ]
};
