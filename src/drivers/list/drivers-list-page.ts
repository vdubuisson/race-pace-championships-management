import { DriverRepository } from '@/db/driver-repository';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiDialogService,
  TuiFilterByInputPipe,
  TuiInput,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiChevron,
  TuiComboBox,
  TuiConfirmData,
  TuiDataListWrapper,
  TuiInputNumber,
} from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { from, of, switchMap } from 'rxjs';
import { DriversListFilters } from './drivers-list-filters';

@Component({
  selector: 'app-drivers-list-page',
  templateUrl: './drivers-list-page.html',
  styleUrl: './drivers-list-page.css',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    SlicePipe,
    TuiButton,
    TuiChevron,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiHeader,
    TuiInput,
    TuiInputNumber,
    TuiTable,
    TuiTablePagination,
    TuiTitle,
    VehicleClassNamePipe,
  ],
  providers: [DriversListFilters],
})
export class DriversListPage {
  readonly filters = inject(DriversListFilters);
  private readonly driverRepository = inject(DriverRepository);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly vehicleClassUtils = inject(VehicleClassUtils);

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredDrivers().length / this.pageSize()),
  );

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  deleteDriver(id: number, name: string, surname: string) {
    const data: TuiConfirmData = {
      content: 'Are you sure you want to delete the driver ' + name + ' ' + surname + '?',
      yes: 'Yes',
      no: 'No',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Delete Driver',
        size: 's',
        data,
      })
      .pipe(
        switchMap((response) => {
          if (response) {
            return from(this.driverRepository.deleteDriver(id)).pipe(
              switchMap(() =>
                this.notifications.open('Driver deleted', {
                  appearance: 'positive',
                  autoClose: 3000,
                  closable: false,
                }),
              ),
            );
          } else {
            return of(undefined);
          }
        }),
      )
      .subscribe();
  }
}
