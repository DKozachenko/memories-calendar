import { provideAnimations } from "@angular/platform-browser/animations";
import { TuiRootModule } from "@taiga-ui/core";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { CommandService } from "./services";

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideRouter(routes), CommandService, importProvidersFrom(TuiRootModule)],
};
