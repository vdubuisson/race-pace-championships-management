import { Routes } from '@angular/router';
import { ImportPage } from './import-page/import-page';

export default [
  { path: '', component: ImportPage },
  { path: 'steps', loadComponent: () => import('./import-steps-page/import-steps-page') },
] satisfies Routes;
