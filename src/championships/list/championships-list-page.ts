import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiCell,
  TuiDialogService,
  TuiFilterByInputPipe,
  TuiIcon,
  TuiInput,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiAutoColorPipe,
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiConfirmData,
  TuiDataListWrapper,
  TuiInputNumber,
  TuiSwitch,
} from '@taiga-ui/kit';
import { TuiHeader, TuiItemGroup } from '@taiga-ui/layout';
import { from, of, switchMap } from 'rxjs';
import { ChampionshipsService } from '../championships-service/championships-service';
import { ChampionshipsListFilters } from './championships-list-filters';

@Component({
  selector: 'app-championships-list-page',
  templateUrl: './championships-list-page.html',
  styleUrl: './championships-list-page.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SlicePipe,
    TuiAutoColorPipe,
    TuiButton,
    TuiCell,
    TuiChevron,
    TuiChip,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiHeader,
    TuiIcon,
    TuiInput,
    TuiInputNumber,
    TuiItemGroup,
    TuiSwitch,
    TuiTable,
    TuiTablePagination,
    TuiTitle,
    VehicleClassNamePipe,
  ],
  providers: [ChampionshipsListFilters],
})
export class ChampionshipsListPage {
  private readonly championshipService = inject(ChampionshipsService);
  readonly filters = inject(ChampionshipsListFilters);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly vehicleClassUtils = inject(VehicleClassUtils);

  protected readonly pageSize = signal(20);
  protected readonly pageIndex = signal(0);

  protected totalPages = computed(() =>
    Math.ceil(this.filters.filteredChampionships().length / this.pageSize()),
  );

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  onPagination(event: TuiTablePaginationEvent) {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
  }

  async deleteChampionship(id: number, name: string): Promise<void> {
    const hasDrivers = await this.championshipService.hasDrivers(name);
    const message = hasDrivers
      ? `The championship ${name} is linked to drivers.<br/>Are you sure you want to delete this championship and its drivers?`
      : `Are you sure you want to delete the championship ${name}?`;

    const data: TuiConfirmData = {
      content: message,
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
        switchMap((response) => {
          if (response) {
            return from(this.championshipService.deleteChampionship(id)).pipe(
              switchMap(() =>
                this.notifications.open('Championship deleted', {
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
