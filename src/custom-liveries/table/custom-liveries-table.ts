import { CustomLiveryRepository } from '@/db/custom-livery-repository';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiButton, TuiDialogService, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { from, of, switchMap } from 'rxjs';
import { CustomLiveriesFetcher } from './custom-liveries-fetcher';

@Component({
  selector: 'app-custom-liveries-table',
  templateUrl: './custom-liveries-table.html',
  styleUrl: './custom-liveries-table.css',
  providers: [CustomLiveriesFetcher],
  imports: [TuiButton, TuiHeader, TuiTable, TuiTitle],
})
export class CustomLiveriesTable {
  private readonly customLiveriesFetcher = inject(CustomLiveriesFetcher);
  private readonly customLiveryRepository = inject(CustomLiveryRepository);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);

  protected readonly customLiveries = toSignal(
    this.customLiveriesFetcher.getCustomLiveriesWithModelInfo(),
  );

  async deleteLivery(id: number): Promise<void> {
    const data: TuiConfirmData = {
      content:
        "Are you sure you want to delete this livery? It won't be removed from championships.",
      yes: 'Yes',
      no: 'No',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Delete Livery',
        size: 's',
        data,
      })
      .pipe(
        switchMap((response) => {
          if (response) {
            return from(this.customLiveryRepository.deleteById(id!)).pipe(
              switchMap(() =>
                this.notifications.open('Livery deleted', {
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
