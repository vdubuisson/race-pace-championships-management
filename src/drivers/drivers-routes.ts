import { canLeaveFormGuard } from '@/shared/guards/can-leave-form/can-leave-form-guard';
import { Routes } from '@angular/router';
import { DriversListPage } from './list/drivers-list-page';

export default [
  { path: '', pathMatch: 'full', component: DriversListPage },
  // {
  //   path: 'details/:id',
  //   loadComponent: () => import('./details/team-details-page'),
  //   resolve: {
  //     team: teamResolver,
  //   },
  //   children: [
  //     {
  //       path: 'global',
  //       loadComponent: () => import('./details/global-tab/team-global-tab'),
  //     },
  //     {
  //       path: 'cars',
  //       loadComponent: () => import('./details/cars-tab/team-cars-tab'),
  //       resolve: { cars: teamCarsResolver },
  //     },
  //     { path: '**', redirectTo: 'global' },
  //   ],
  // },
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
