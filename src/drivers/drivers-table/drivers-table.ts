import { Driver } from '@/shared/models/driver';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { DecimalPipe, SlicePipe } from '@angular/common';
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
import { RouterLink } from '@angular/router';
import {
  TuiTable,
  TuiTableControl,
  TuiTablePagination,
  TuiTablePaginationEvent,
} from '@taiga-ui/addon-table';
import { TuiButton, TuiCell, TuiCheckbox, TuiFilterByInputPipe, TuiInput } from '@taiga-ui/core';
import { TuiChevron, TuiComboBox, TuiDataListWrapper, TuiInputNumber } from '@taiga-ui/kit';
import { DriversTableFilters } from './drivers-table-filters';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-drivers-table',
  templateUrl: './drivers-table.html',
  styleUrl: './drivers-table.css',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    SlicePipe,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiChevron,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiInput,
    TuiInputNumber,
    TuiTable,
    TuiTableControl,
    TuiTablePagination,
    VehicleClassNamePipe,
  ],
  providers: [DriversTableFilters],
})
export class DriversTable {
  private readonly vehicleClassUtils = inject(VehicleClassUtils);
  protected readonly filters = inject(DriversTableFilters);

  readonly drivers = input.required<Driver[]>();
  readonly mode = input<'list' | 'import'>('list');

  readonly selectedIds = output<number[]>();
  readonly onDeleteDriver = output<Driver>();

  protected readonly pageSize = linkedSignal(() =>
    this.mode() === 'import' ? this.filters.filteredDrivers().length : 20,
  );
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredDrivers().length / this.pageSize()),
  );

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  constructor() {
    effect(() => this.filters.drivers.set(this.drivers()));
    this.filters.form.controls.selectedIds.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((selected) => this.selectedIds.emit(selected));
  }

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  deleteDriver(driver: Driver): void {
    this.onDeleteDriver.emit(driver);
  }
}
