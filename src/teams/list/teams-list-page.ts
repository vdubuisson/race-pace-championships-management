import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import { TeamRepository } from '@/db/team-repository';
import { from } from 'rxjs';

@Component({
  selector: 'app-teams-list-page',
  templateUrl: './teams-list-page.html',
  styleUrl: './teams-list-page.css',
  imports: [RouterLink, SlicePipe, TuiButton, TuiHeader, TuiTable, TuiTablePagination, TuiTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsListPage {
  private readonly teamRepository = inject(TeamRepository);

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected teams = toSignal(from(this.teamRepository.getAllTeams()), { initialValue: [] });

  protected totalPages = computed(() => Math.ceil(this.teams().length / this.pageSize()));

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }
}
