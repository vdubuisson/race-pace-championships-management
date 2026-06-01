import { canLeaveFormGuard } from '@/shared/guards/can-leave-form/can-leave-form-guard';
import { Routes } from '@angular/router';
import { TeamsListPage } from '../teams/list/teams-list-page';

export default [
  { path: '', pathMatch: 'full', component: TeamsListPage },
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
