import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiCell,
  TuiDialogService,
  TuiFilterByInputPipe,
  TuiIcon,
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
  TuiSwitch,
} from '@taiga-ui/kit';
import { TuiHeader, TuiItemGroup } from '@taiga-ui/layout';
import { of, switchMap } from 'rxjs';
import { ChampionshipsService } from '../championships-service/championships-service';
import { ChampionshipsListFilters } from './championships-list-filters';

@Component({
  selector: 'app-championships-list-page',
  templateUrl: './championships-list-page.html',
  styleUrl: './championships-list-page.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SlicePipe,
    TuiAutoColorPipe,
    TuiButton,
    TuiCell,
    TuiChevron,
    TuiChip,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiHeader,
    TuiIcon,
    TuiInput,
    TuiInputNumber,
    TuiItemGroup,
    TuiSwitch,
    TuiTable,
    TuiTablePagination,
    TuiTitle,
  ],
  providers: [ChampionshipsListFilters],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChampionshipsListPage {
  private readonly championshipService = inject(ChampionshipsService);
  readonly filters = inject(ChampionshipsListFilters);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredChampionships().length / this.pageSize()),
  );

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  deleteChampionship(id: number, name: string) {
    const data: TuiConfirmData = {
      content: 'Are you sure you want to delete the championship ' + name + '?',
      yes: 'Yes',
      no: 'No',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Delete Championship',
        size: 's',
        data,
      })
      .pipe(
        switchMap(async (response) => {
          if (response) {
            await this.championshipService.deleteChampionship(id);
            return this.notifications.open('Championship deleted', {
              appearance: 'positive',
              autoClose: 3000,
              closable: false,
            });
          } else {
            return of(undefined);
          }
        }),
      )
      .subscribe();
  }
}
