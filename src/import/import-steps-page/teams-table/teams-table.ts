import { Team } from '@/shared/models/team';
import { NgTemplateOutlet, SlicePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiCell, TuiCheckbox, TuiInput } from '@taiga-ui/core';
import { TuiChevron, TuiInputNumber } from '@taiga-ui/kit';
import { TeamsTableFilters, TeamWithConflict } from './teams-table-filters';

@Component({
  selector: 'app-teams-table',
  templateUrl: './teams-table.html',
  styleUrl: './teams-table.css',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    SlicePipe,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiChevron,
    TuiInput,
    TuiInputNumber,
    TuiTable,
    TuiTablePagination,
  ],
  providers: [TeamsTableFilters],
})
export class TeamsTable {
  protected readonly filters = inject(TeamsTableFilters);

  readonly teams = input.required<Team[]>();
  readonly conflictingTeams = input<Team[]>([]);
  readonly preSelectedTeamNames = input<Set<string>>(new Set());

  readonly selectedIds = output<number[]>();

  protected readonly isAllSelected = computed(
    () => this.checkedIds().length === this.filters.filteredTeams().length,
  );

  protected readonly isAtLeastOneSelected = computed(() => this.checkedIds().length > 0);

  protected readonly checkedIds = linkedSignal<number[]>(() =>
    this.teams()
      .filter((team) => this.preSelectedTeamNames().has(team.name))
      .map((team) => team.id!),
  );

  protected readonly isCheckedById = computed<Record<number, boolean>>(() => {
    const checkedIdsSet = new Set(this.checkedIds());
    return this.filters.filteredTeams().reduce(
      (acc, team) => {
        acc[team.id!] = checkedIdsSet.has(team.id!);
        return acc;
      },
      {} as Record<number, boolean>,
    );
  });

  protected selectAll(): void {
    if (this.isAllSelected()) {
      this.checkedIds.set([]);
    } else {
      this.checkedIds.set(this.filters.filteredTeams().map((team) => team.id!));
    }
  }

  protected selectRow(teamId: number): void {
    const isChecked = this.isCheckedById()[teamId];
    if (isChecked) {
      this.checkedIds.update((ids) => ids.filter((id) => id !== teamId));
    } else {
      this.checkedIds.update((ids) => [...ids, teamId]);
    }
  }

  protected readonly teamsWithConflicts = computed<TeamWithConflict[]>(() => {
    const conflictsByName = new Map<string, Team>();
    this.conflictingTeams().forEach((conflict) => {
      conflictsByName.set(conflict.name, conflict);
    });
    return this.teams().map((team) => ({
      ...team,
      conflict: conflictsByName.get(team.name),
    }));
  });

  protected expandedState = signal<Record<number, boolean>>({});

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredTeams().length / this.pageSize()),
  );

  constructor() {
    effect(() => this.filters.teams.set(this.teamsWithConflicts()));
    effect(() => {
      const filteredIds = this.filters.filteredTeams().map((c) => c.id!);
      this.checkedIds.update((ids) => ids.filter((id) => filteredIds.includes(id)));
    });
    effect(() => this.selectedIds.emit(this.checkedIds()));
  }

  protected onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  protected toggleRow(teamId: number) {
    this.expandedState.update((state) => ({
      ...state,
      [teamId]: !state[teamId],
    }));
  }
}
