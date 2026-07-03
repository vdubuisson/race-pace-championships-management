import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTaiga, TUI_VALIDATION_ERRORS } from '@taiga-ui/core';
import routes from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    DatePipe,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
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
