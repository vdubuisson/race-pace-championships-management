import { Routes } from '@angular/router';
import { TeamsListPage } from '../teams/list/teams-list-page';

export const teamsRoutes: Routes = [
  { path: '', pathMatch: 'full', component: TeamsListPage },
  { path: 'form', loadComponent: () => import('../teams/form/team-form') },
  { path: 'form/:id', loadComponent: () => import('../teams/form/team-form') },
  { path: '**', redirectTo: '' },
];

export default teamsRoutes;
