import { Championship } from '@/shared/models/championship';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { NgTemplateOutlet, SlicePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
  TuiFilterByInputPipe,
  TuiIcon,
  TuiInput,
} from '@taiga-ui/core';
import {
  TuiAutoColorPipe,
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInputNumber,
  TuiSwitch,
} from '@taiga-ui/kit';
import { TuiItemGroup } from '@taiga-ui/layout';
import { ChampionshipsTableFilters, ChampionshipWithConflict } from './championships-table-filters';

@Component({
  selector: 'app-championships-table',
  templateUrl: './championships-table.html',
  styleUrl: './championships-table.css',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    RouterLink,
    SlicePipe,
    TuiAutoColorPipe,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiChevron,
    TuiChip,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiIcon,
    TuiInput,
    TuiInputNumber,
    TuiItemGroup,
    TuiSwitch,
    TuiTable,
    TuiTablePagination,
    VehicleClassNamePipe,
  ],
  providers: [ChampionshipsTableFilters],
})
export class ChampionshipsTable {
  protected readonly filters = inject(ChampionshipsTableFilters);
  private readonly vehicleClassUtils = inject(VehicleClassUtils);

  readonly mode = input<'list' | 'export' | 'import'>('list');
  readonly championships = input.required<Championship[]>();
  readonly conflictingChampionships = input<Championship[]>([]);

  readonly onDeleteChampionship = output<Championship>();
  readonly selectedIds = output<number[]>();

  protected readonly isAllSelected = computed(
    () => this.checkedIds().length === this.filters.filteredChampionships().length,
  );

  protected readonly isAtLeastOneSelected = computed(() => this.checkedIds().length > 0);

  protected readonly checkedIds = signal<number[]>([]);

  protected readonly isCheckedById = computed<Record<number, boolean>>(() => {
    const checkedIdsSet = new Set(this.checkedIds());
    return this.filters.filteredChampionships().reduce(
      (acc, championship) => {
        acc[championship.id!] = checkedIdsSet.has(championship.id!);
        return acc;
      },
      {} as Record<number, boolean>,
    );
  });

  protected readonly championshipsWithConflicts = computed<ChampionshipWithConflict[]>(() => {
    const conflictsByName = new Map<string, Championship>();
    this.conflictingChampionships().forEach((conflict) => {
      conflictsByName.set(conflict.name, conflict);
    });
    return this.championships().map((championship) => ({
      ...championship,
      conflict: conflictsByName.get(championship.name),
    }));
  });

  protected expandedState = signal<Record<number, boolean>>({});

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredChampionships().length / this.pageSize()),
  );

  constructor() {
    effect(() => this.filters.championships.set(this.championshipsWithConflicts()));
    effect(() => {
      const filteredIds = this.filters.filteredChampionships().map((c) => c.id!);
      this.checkedIds.update((ids) => ids.filter((id) => filteredIds.includes(id)));
    });
    effect(() => this.selectedIds.emit(this.checkedIds()));
  }

  protected onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  protected selectAll(): void {
    if (this.isAllSelected()) {
      this.checkedIds.set([]);
    } else {
      this.checkedIds.set(this.filters.filteredChampionships().map((c) => c.id!));
    }
  }

  protected selectRow(championshipId: number): void {
    const isChecked = this.isCheckedById()[championshipId];
    if (isChecked) {
      this.checkedIds.update((ids) => ids.filter((id) => id !== championshipId));
    } else {
      this.checkedIds.update((ids) => [...ids, championshipId]);
    }
  }

  protected toggleRow(championshipId: number) {
    this.expandedState.update((state) => ({
      ...state,
      [championshipId]: !state[championshipId],
    }));
  }

  protected deleteChampionship(championship: Championship): void {
    this.onDeleteChampionship.emit(championship);
  }
}
