import { Championship } from '@/shared/models/championship';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiDialogService, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { from, of, switchMap } from 'rxjs';
import { ChampionshipsService } from '../championships-service/championships-service';
import { ChampionshipsTable } from '../championships-table/championships-table';

@Component({
  selector: 'app-championships-list-page',
  templateUrl: './championships-list-page.html',
  styleUrl: './championships-list-page.css',
  imports: [ChampionshipsTable, RouterLink, TuiButton, TuiHeader, TuiTitle],
})
export class ChampionshipsListPage {
  private readonly championshipService = inject(ChampionshipsService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);

  protected readonly championships = toSignal(this.championshipService.getAllChampionships(), {
    initialValue: [],
  });

  async deleteChampionship(championship: Championship): Promise<void> {
    const { id, name } = championship;
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
            return from(this.championshipService.deleteChampionship(id!)).pipe(
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
