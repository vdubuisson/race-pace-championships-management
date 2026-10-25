import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import { CustomLiveriesImportSection } from '../import/custom-liveries-import-section';
import { CustomLiveriesTable } from '../table/custom-liveries-table';

@Component({
  selector: 'app-custom-liveries-page',
  templateUrl: './custom-liveries-page.html',
  styleUrl: './custom-liveries-page.css',
  imports: [
    CustomLiveriesImportSection,
    CustomLiveriesTable,
    RouterLink,
    TuiButton,
    TuiHeader,
    TuiTitle,
  ],
})
export class CustomLiveriesPage {}
