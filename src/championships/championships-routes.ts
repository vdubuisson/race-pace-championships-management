import { canLeaveFormGuard } from '@/shared/guards/can-leave-form/can-leave-form-guard';
import { Routes } from '@angular/router';
import { championshipCarsResolver } from './details/resolvers/championship-cars-resolver';
import { championshipEventsResolver } from './details/resolvers/championship-events-resolver';
import { championshipResolver } from './details/resolvers/championship-resolver';
import { ChampionshipsListPage } from './list/championships-list-page';

export default [
  { path: '', pathMatch: 'full', component: ChampionshipsListPage },
  {
    path: 'details/:id',
    loadComponent: () => import('./details/championships-details-page'),
    resolve: {
      championship: championshipResolver,
    },
    children: [
      {
        path: 'global',
        loadComponent: () => import('./details/global-tab/championship-global-tab'),
      },
      {
        path: 'events',
        loadComponent: () => import('./details/events-tab/championship-events-tab'),
        resolve: { events: championshipEventsResolver },
      },
      {
        path: 'cars',
        loadComponent: () => import('./details/cars-tab/championship-cars-tab'),
        resolve: { cars: championshipCarsResolver },
      },
      { path: '**', redirectTo: 'global' },
    ],
  },
  {
    path: 'form',
    loadComponent: () => import('./form/championships-form-page'),
    canDeactivate: [canLeaveFormGuard],
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./form/championships-form-page'),
    resolve: {
      championship: championshipResolver,
    },
    canDeactivate: [canLeaveFormGuard],
  },
  { path: '**', redirectTo: '' },
] satisfies Routes;
