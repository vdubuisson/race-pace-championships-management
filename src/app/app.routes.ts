import { Routes } from '@angular/router';
import { HomePage } from '../home/home-page';

export default [
  { path: '', pathMatch: 'full', component: HomePage },
  { path: 'teams', loadChildren: () => import('@/teams/teams-routes') },
  { path: 'championships', loadChildren: () => import('@/championships/championships-routes') },
  { path: 'drivers', loadChildren: () => import('@/drivers/drivers-routes') },
  { path: 'import', loadChildren: () => import('@/import/import-routes') },
  { path: 'export', loadChildren: () => import('@/export/export-routes') },
  { path: '**', redirectTo: '' },
] satisfies Routes;
