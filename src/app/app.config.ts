import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import localeRu from '@angular/common/locales/ru';
import localeRuExtra from '@angular/common/locales/extra/ru';
import { TuiRootModule } from '@taiga-ui/core';

import { routes } from './app.routes';
import { CommandService } from './services';

const locale: string = 'ru-RU';
registerLocaleData(localeRu, locale, localeRuExtra);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    CommandService,
    importProvidersFrom(TuiRootModule),
    {
      provide: LOCALE_ID,
      useValue: locale,
    },
  ],
};
