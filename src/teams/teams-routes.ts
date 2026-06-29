import { canLeaveFormGuard } from '@/shared/guards/can-leave-form/can-leave-form-guard';
import { Routes } from '@angular/router';
import { TeamsListPage } from '../teams/list/teams-list-page';
import { teamResolver } from './details/resolvers/team-resolver';
import { teamCarsResolver } from './details/resolvers/team-cars-resolver';

export default [
  { path: '', pathMatch: 'full', component: TeamsListPage },
  {
    path: 'details/:id',
    loadComponent: () => import('./details/team-details-page'),
    resolve: {
      team: teamResolver,
    },
    children: [
      {
        path: 'global',
        loadComponent: () => import('./details/global-tab/team-global-tab'),
      },
      {
        path: 'cars',
        loadComponent: () => import('./details/cars-tab/team-cars-tab'),
        resolve: { cars: teamCarsResolver },
      },
      { path: '**', redirectTo: 'global' },
    ],
  },
  {
    path: 'form',
    loadComponent: () => import('../teams/form/team-form'),
    canDeactivate: [canLeaveFormGuard],
  },
  {
    path: 'form/:id',
    loadComponent: () => import('../teams/form/team-form'),
    canDeactivate: [canLeaveFormGuard],
  },
  { path: '**', redirectTo: '' },
] satisfies Routes;
