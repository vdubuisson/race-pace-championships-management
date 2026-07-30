import { DriverRepository } from '@/db/driver-repository';
import { Driver } from '@/shared/models/driver';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiDialogService, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { from, of, switchMap } from 'rxjs';
import { DriversTable } from '../drivers-table/drivers-table';

@Component({
  selector: 'app-drivers-list-page',
  templateUrl: './drivers-list-page.html',
  styleUrl: './drivers-list-page.css',
  imports: [DriversTable, RouterLink, TuiButton, TuiHeader, TuiTitle],
})
export class DriversListPage {
  private readonly driverRepository = inject(DriverRepository);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);

  protected drivers = toSignal(this.driverRepository.getAllDrivers(), { initialValue: [] });

  deleteDriver(driver: Driver) {
    const data: TuiConfirmData = {
      content:
        'Are you sure you want to delete the driver ' + driver.name + ' ' + driver.surname + '?',
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
            return from(this.driverRepository.deleteDriver(driver.id!)).pipe(
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
