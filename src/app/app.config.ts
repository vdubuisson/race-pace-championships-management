import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideTaiga, TUI_VALIDATION_ERRORS } from '@taiga-ui/core';
import { ChampionshipRepository } from '@/db/championship-repository';
import { EventRepository } from '@/db/event-repository';
import { TeamRepository } from '@/db/team-repository';
import { routes } from './app.routes';
import { TrackRepository } from '@/db/track-repository';
import { CarRepository } from '@/db/car-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(withFetch()),
    provideAppInitializer(() =>
      Promise.all([
        inject(CarRepository).initialize(),
        inject(ChampionshipRepository).initialize(),
        inject(EventRepository).initialize(),
        inject(TeamRepository).initialize(),
        inject(TrackRepository).initialize(),
        inject(VehicleClassRepository).initialize(),
      ]),
    ),
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
