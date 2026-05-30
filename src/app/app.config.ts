import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { EventRepository } from '@/db/event-repository';
import { LiveryRepository } from '@/db/livery-repository';
import { ModelRepository } from '@/db/model-repository';
import { TeamRepository } from '@/db/team-repository';
import { TrackRepository } from '@/db/track-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { DatePipe } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideTaiga, TUI_VALIDATION_ERRORS } from '@taiga-ui/core';
import routes from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    DatePipe,
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
        inject(LiveryRepository).initialize(),
        inject(TeamRepository).initialize(),
        inject(TrackRepository).initialize(),
        inject(VehicleClassRepository).initialize(),
        inject(ModelRepository).initialize(),
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
