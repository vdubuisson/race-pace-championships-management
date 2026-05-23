import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { TuiHeader, TuiItemGroup } from '@taiga-ui/layout';
import { from } from 'rxjs';
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

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected championships = toSignal(from(this.championshipService.getChampionships()), {
    initialValue: [],
  });

  protected totalPages = computed(() => Math.ceil(this.championships().length / this.pageSize()));

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }
}
