import { Routes } from '@angular/router';
import { ChampionshipsListPage } from './list/championships-list-page';
import { championshipResolver } from './details/championship-resolver';
import { championshipEventsResolver } from './details/championship-events-resolver';

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
      { path: '**', redirectTo: 'global' },
    ],
  },
  // { path: 'form', loadComponent: () => import('./form/championship-form') },
  // { path: 'form/:id', loadComponent: () => import('./form/championship-form') },
  { path: '**', redirectTo: '' },
];

export default championshipsRoutes;
