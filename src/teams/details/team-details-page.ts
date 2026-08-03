import { Team } from '@/shared/models/team';
import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton, TuiDialogService, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData, TuiTabs } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { of, switchMap } from 'rxjs';
import { TeamsService } from '../teams-service/teams-service';

@Component({
  selector: 'app-team-details-page',
  templateUrl: './team-details-page.html',
  styleUrl: './team-details-page.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton, TuiHeader, TuiTabs, TuiTitle],
})
export default class TeamDetailsPage {
  private readonly teamsService = inject(TeamsService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly router = inject(Router);

  readonly team = input.required<Team>();

  protected readonly tabs = [
    { label: 'Global', url: 'global', icon: '@tui.info' },
    { label: 'Cars', url: 'cars', icon: '@tui.car' },
  ];

  async deleteTeam(): Promise<void> {
    const hasLinks = await this.teamsService.hasLinks(this.team().name);
    const message = hasLinks
      ? `The team ${this.team().name} is linked to cars and/or drivers. <br /> Are you sure you want to delete this team and its cars/drivers?`
      : `Are you sure you want to delete the team ${this.team().name}?`;

    const data: TuiConfirmData = {
      content: message,
      yes: 'Yes',
      no: 'No',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Delete Team',
        size: 's',
        data,
      })
      .pipe(
        switchMap(async (response) => {
          if (response) {
            await this.teamsService.deleteTeam(this.team().id!);
            this.notifications
              .open('Team deleted', {
                appearance: 'positive',
                autoClose: 3000,
                closable: false,
              })
              .subscribe();
            this.router.navigate(['/teams']);
          }
          return of(undefined);
        }),
      )
      .subscribe();
  }
}
