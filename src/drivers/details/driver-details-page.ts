import { DriverRepository } from '@/db/driver-repository';
import { PercentChartCard } from '@/shared/components/percent-chart-card/percent-chart-card';
import { Driver } from '@/shared/models/driver';
import { CountryCodePipe } from '@/shared/pipes/country-code/country-code-pipe';
import { CountryNamePipe } from '@/shared/pipes/country-name/country-name-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiCell,
  TuiDialogService,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar, TuiConfirmData, TuiFlagPipe } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-driver-details',
  templateUrl: './driver-details-page.html',
  styleUrl: './driver-details-page.css',
  imports: [
    CountryCodePipe,
    CountryNamePipe,
    DatePipe,
    DecimalPipe,
    OrdinalPipe,
    PercentChartCard,
    PercentPipe,
    RouterLink,
    TuiAvatar,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiFlagPipe,
    TuiHeader,
    TuiTitle,
  ],
})
export default class DriverDetailsPage {
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly router = inject(Router);
  private readonly driverRepository = inject(DriverRepository);

  readonly driver = input.required<Driver>();

  deleteDriver() {
    const data: TuiConfirmData = {
      content:
        'Are you sure you want to delete the driver ' +
        this.driver().name +
        ' ' +
        this.driver().surname +
        '?',
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
        switchMap(async (response) => {
          if (response) {
            await this.driverRepository.deleteDriver(this.driver().id!);
            this.notifications
              .open('Driver deleted', {
                appearance: 'positive',
                autoClose: 3000,
                closable: false,
              })
              .subscribe();
            this.router.navigate(['/drivers']);
          }
          return of(undefined);
        }),
      )
      .subscribe();
  }
}
