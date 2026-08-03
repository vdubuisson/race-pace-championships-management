import { Team } from '@/shared/models/team';
import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TeamsTableFilters } from './teams-table-filters';
import { TuiTable, TuiTableControl } from '@taiga-ui/addon-table';
import { TuiCell, TuiCheckbox, TuiInput } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-teams-table',
  templateUrl: './teams-table.html',
  styleUrl: './teams-table.css',
  imports: [
    ReactiveFormsModule,
    TuiCell,
    TuiCheckbox,
    TuiInput,
    TuiInputNumber,
    TuiTableControl,
    TuiTable,
  ],
  providers: [TeamsTableFilters],
})
export class TeamsTable {
  protected readonly filters = inject(TeamsTableFilters);

  readonly teams = input.required<Team[]>();

  readonly selectedIds = output<number[]>();

  constructor() {
    effect(() => this.filters.teams.set(this.teams()));
    this.filters.form.controls.selectedIds.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((selected) => this.selectedIds.emit(selected));
  }
}
