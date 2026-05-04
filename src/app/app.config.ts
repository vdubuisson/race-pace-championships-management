import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTaiga, TUI_VALIDATION_ERRORS } from '@taiga-ui/core';
import { TeamRepository } from '../db/team-repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => inject(TeamRepository).initialize()),
    provideTaiga(),
    {
            provide: TUI_VALIDATION_ERRORS,
            useFactory: () => ({
                required: 'This field is required',
                min: ({ min }: { min: number }) => `Value should be greater than ${min}`,
                max: ({ max }: { max: number }) => `Value should be less than ${max}`,
            }),
        },
  ],
};
