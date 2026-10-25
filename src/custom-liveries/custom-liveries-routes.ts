import { Routes } from '@angular/router';
import { CustomLiveriesPage } from './page/custom-liveries-page';

export default [
    { path: '', pathMatch: 'full', component: CustomLiveriesPage },
    { path: '**', redirectTo: '' },
] satisfies Routes;
