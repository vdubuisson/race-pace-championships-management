import { Routes } from '@angular/router';
import { driverResolver } from './details/resolvers/driver-resolver';
import { DriversListPage } from './list/drivers-list-page';

export default [
  { path: '', pathMatch: 'full', component: DriversListPage },
  {
    path: 'details/:id',
    loadComponent: () => import('./details/driver-details-page'),
    resolve: {
      driver: driverResolver,
    },
  },
  // {
  //   path: 'form',
  //   loadComponent: () => import('../teams/form/team-form'),
  //   canDeactivate: [canLeaveFormGuard],
  // },
  // {
  //   path: 'form/:id',
  //   loadComponent: () => import('../teams/form/team-form'),
  //   canDeactivate: [canLeaveFormGuard],
  // },
  { path: '**', redirectTo: '' },
] satisfies Routes;
