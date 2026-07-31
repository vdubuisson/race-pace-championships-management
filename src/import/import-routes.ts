import { Routes } from '@angular/router';
import { ImportPage } from './import-page/import-page';
import ImportStepsPage from './import-steps-page/import-steps-page';

export default [
  { path: '', component: ImportPage },
  { path: 'steps', component: ImportStepsPage },
] satisfies Routes;
