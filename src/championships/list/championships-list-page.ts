import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiDialogService,
  TuiIcon,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAutoColorPipe, TuiChip, TuiConfirmData } from '@taiga-ui/kit';
import { TuiHeader, TuiItemGroup } from '@taiga-ui/layout';
import { of, switchMap } from 'rxjs';
import { ChampionshipsService } from '../championships-service/championships-service';

@Component({
  selector: 'app-championships-list-page',
  templateUrl: './championships-list-page.html',
  styleUrl: './championships-list-page.css',
  imports: [
    RouterLink,
    SlicePipe,
    TuiAutoColorPipe,
    TuiButton,
    TuiChip,
    TuiHeader,
    TuiIcon,
    TuiItemGroup,
    TuiTable,
    TuiTablePagination,
    TuiTitle,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChampionshipsListPage {
  private readonly championshipService = inject(ChampionshipsService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected championships = toSignal(this.championshipService.getChampionships(), {
    initialValue: [],
  });

  protected totalPages = computed(() => Math.ceil(this.championships().length / this.pageSize()));

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
