import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton, TuiDialogService, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData, TuiTabs } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { Championship } from '@/shared/models/championship';
import { of, switchMap } from 'rxjs';
import { ChampionshipsService } from '../championships-service/championships-service';

@Component({
  selector: 'app-championships-details-page',
  templateUrl: './championships-details-page.html',
  styleUrl: './championships-details-page.css',
  imports: [RouterLink, RouterLinkActive, TuiButton, TuiHeader, TuiTabs, TuiTitle, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChampionshipsDetailsPage {
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly router = inject(Router);
  private readonly championshipService = inject(ChampionshipsService);

  readonly championship = input.required<Championship>();

  protected readonly tabs = [
    { label: 'Global', url: 'global', icon: '@tui.info' },
    { label: 'Events', url: 'events', icon: '@tui.calendars' },
    { label: 'Cars', url: 'cars', icon: '@tui.car' },
  ];

  deleteChampionship() {
    const data: TuiConfirmData = {
      content: 'Are you sure you want to delete the championship ' + this.championship().name + '?',
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
        switchMap(async (response) => {
          if (response) {
            await this.championshipService.deleteChampionship(this.championship().id!);
            this.notifications
              .open('Championship deleted', {
                appearance: 'positive',
                autoClose: 3000,
                closable: false,
              })
              .subscribe();
            this.router.navigate(['/championships']);
          }
          return of(undefined);
        }),
      )
      .subscribe();
  }
}
