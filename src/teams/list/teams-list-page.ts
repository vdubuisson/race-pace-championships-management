import { SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiDialogService,
  TuiFilterByInputPipe,
  TuiInput,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiAutoColorPipe,
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiConfirmData,
  TuiDataListWrapper,
  TuiInputNumber,
} from '@taiga-ui/kit';
import { TuiHeader, TuiItemGroup } from '@taiga-ui/layout';
import { from, of, switchMap } from 'rxjs';
import { TeamsService } from '../teams-service/teams-service';
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
  private readonly dialogs = inject(TuiDialogService);
  private readonly teamsService = inject(TeamsService);
  private readonly notifications = inject(TuiNotificationService);

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

  async deleteTeam(id: number, name: string): Promise<void> {
    const hasLinks = await this.teamsService.hasLinks(name);
    const message = hasLinks
      ? `The team ${name} is linked to cars and/or drivers. <br /> Are you sure you want to delete this team and its cars/drivers?`
      : `Are you sure you want to delete the team ${name}?`;

    const data: TuiConfirmData = {
      content: message,
      yes: 'Yes',
      no: 'No',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Delete Team',
        size: 's',
        data,
      })
      .pipe(
        switchMap((response) => {
          if (response) {
            return from(this.teamsService.deleteTeam(id)).pipe(
              switchMap(() =>
                this.notifications.open('Team deleted', {
                  appearance: 'positive',
                  autoClose: 3000,
                  closable: false,
                }),
              ),
            );
          } else {
            return of(undefined);
          }
        }),
      )
      .subscribe();
  }
}
