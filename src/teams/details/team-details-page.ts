import { Team } from '@/shared/models/team';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiTabs } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-details-page',
  templateUrl: './team-details-page.html',
  styleUrl: './team-details-page.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiButton, TuiHeader, TuiTabs, TuiTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TeamDetailsPage {
  readonly team = input.required<Team>();

  protected readonly tabs = [
    { label: 'Global', url: 'global', icon: '@tui.info' },
    { label: 'Cars', url: 'cars', icon: '@tui.car' },
  ];
}
