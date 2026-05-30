import { Routes } from '@angular/router';
import { championshipCarsResolver } from './details/resolvers/championship-cars-resolver';
import { championshipEventsResolver } from './details/resolvers/championship-events-resolver';
import { championshipResolver } from './details/resolvers/championship-resolver';
import { ChampionshipsListPage } from './list/championships-list-page';
import { canLeaveChampionshipFormGuard } from './form/can-leave-guard/can-leave-championship-form-guard';

export const championshipsRoutes: Routes = [
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
    canDeactivate: [canLeaveChampionshipFormGuard],
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./form/championships-form-page'),
    resolve: {
      championship: championshipResolver,
    },
    canDeactivate: [canLeaveChampionshipFormGuard],
  },
  { path: '**', redirectTo: '' },
];

export default championshipsRoutes;
