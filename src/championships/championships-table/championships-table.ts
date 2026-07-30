import { Championship } from '@/shared/models/championship';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { SlicePipe } from '@angular/common';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TuiTable,
  TuiTableControl,
  TuiTablePagination,
  TuiTablePaginationEvent,
} from '@taiga-ui/addon-table';
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
import { ChampionshipsTableFilters } from './championships-table-filters';

@Component({
  selector: 'app-championships-table',
  templateUrl: './championships-table.html',
  styleUrl: './championships-table.css',
  imports: [
    ReactiveFormsModule,
    FormsModule,
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
    TuiTableControl,
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

  readonly onDeleteChampionship = output<Championship>();
  readonly selectedIds = output<number[]>();

  protected readonly pageSize = linkedSignal(() =>
    this.mode() === 'export' || this.mode() === 'import'
      ? this.filters.filteredChampionships().length
      : 20,
  );
  protected readonly pageIndex = signal(0);

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredChampionships().length / this.pageSize()),
  );

  constructor() {
    effect(() => this.filters.championships.set(this.championships()));
    this.filters.form.controls.selectedIds.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((selected) => this.selectedIds.emit(selected));
  }

  protected onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  deleteChampionship(championship: Championship): void {
    this.onDeleteChampionship.emit(championship);
  }
}
