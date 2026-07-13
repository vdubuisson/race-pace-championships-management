import { Routes } from '@angular/router';
import { driverResolver } from './details/resolvers/driver-resolver';
import { DriversListPage } from './list/drivers-list-page';
import { canLeaveFormGuard } from '@/shared/guards/can-leave-form/can-leave-form-guard';

export default [
  { path: '', pathMatch: 'full', component: DriversListPage },
  {
    path: 'details/:id',
    loadComponent: () => import('./details/driver-details-page'),
    resolve: {
      driver: driverResolver,
    },
  },
  {
    path: 'form',
    loadComponent: () => import('../drivers/form/driver-form'),
    canDeactivate: [canLeaveFormGuard],
  },
  {
    path: 'form/:id',
    loadComponent: () => import('../drivers/form/driver-form'),
    canDeactivate: [canLeaveFormGuard],
    resolve: {
      driver: driverResolver,
    },
  },
  { path: '**', redirectTo: '' },
] satisfies Routes;
