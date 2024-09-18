import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { SetBaseUrlPipe } from './shared/pipe/set-base-url.pipe';
import { CurrencyCustomPipe } from './shared/pipe/currency-custom.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    SetBaseUrlPipe,
    CurrencyCustomPipe
  ]
};
