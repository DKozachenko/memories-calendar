import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import localeRu from '@angular/common/locales/ru';
import localeRuExtra from '@angular/common/locales/extra/ru';
import { TuiRootModule } from '@taiga-ui/core';

import { routes } from './app.routes';
import { CommandService, EventBuildService, StoreService } from './services';

const locale: string = 'ru-RU';
registerLocaleData(localeRu, locale, localeRuExtra);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    importProvidersFrom(TuiRootModule),
    {
      provide: LOCALE_ID,
      useValue: locale,
    },
    CommandService,
    EventBuildService,
    StoreService,
  ],
};
