import { Driver } from '@/shared/models/driver';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiCell, TuiCheckbox, TuiFilterByInputPipe, TuiInput } from '@taiga-ui/core';
import { TuiChevron, TuiComboBox, TuiDataListWrapper, TuiInputNumber } from '@taiga-ui/kit';
import { DriversTableFilters } from './drivers-table-filters';

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

  protected readonly isAllSelected = computed(
    () => this.checkedIds().length === this.filters.filteredDrivers().length,
  );

  protected readonly isAtLeastOneSelected = computed(() => this.checkedIds().length > 0);

  protected readonly checkedIds = signal<number[]>([]);

  protected readonly isCheckedById = computed<Record<number, boolean>>(() => {
    const checkedIdsSet = new Set(this.checkedIds());
    return this.filters.filteredDrivers().reduce(
      (acc, driver) => {
        acc[driver.id!] = checkedIdsSet.has(driver.id!);
        return acc;
      },
      {} as Record<number, boolean>,
    );
  });

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredDrivers().length / this.pageSize()),
  );

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  constructor() {
    effect(() => this.filters.drivers.set(this.drivers()));
    effect(() => {
      const filteredIds = this.filters.filteredDrivers().map((d) => d.id!);
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
      this.checkedIds.set(this.filters.filteredDrivers().map((d) => d.id!));
    }
  }

  protected selectRow(driverId: number): void {
    const isChecked = this.isCheckedById()[driverId];
    if (isChecked) {
      this.checkedIds.update((ids) => ids.filter((id) => id !== driverId));
    } else {
      this.checkedIds.update((ids) => [...ids, driverId]);
    }
  }

  protected deleteDriver(driver: Driver): void {
    this.onDeleteDriver.emit(driver);
  }
}
