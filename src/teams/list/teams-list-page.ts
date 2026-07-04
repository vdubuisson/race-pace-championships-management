import { SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiFilterByInputPipe, TuiInput, TuiTitle } from '@taiga-ui/core';
import {
  TuiAutoColorPipe,
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInputNumber,
} from '@taiga-ui/kit';
import { TuiHeader, TuiItemGroup } from '@taiga-ui/layout';
import { TeamsListFilters } from './teams-list-filters';

@Component({
  selector: 'app-teams-list-page',
  templateUrl: './teams-list-page.html',
  styleUrl: './teams-list-page.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SlicePipe,
    TuiAutoColorPipe,
    TuiButton,
    TuiChevron,
    TuiChip,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiHeader,
    TuiInput,
    TuiInputNumber,
    TuiItemGroup,
    TuiTable,
    TuiTablePagination,
    TuiTitle,
  ],
  providers: [TeamsListFilters],
})
export class TeamsListPage {
  readonly filters = inject(TeamsListFilters);

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredTeams().length / this.pageSize()),
  );

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }
}
