import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { TuiButton, TuiTitle } from "@taiga-ui/core";
import { TuiTabs } from "@taiga-ui/kit";
import { TuiHeader } from "@taiga-ui/layout";
import { Championship } from "../../resources/models/championship";

@Component({
  selector: 'app-championships-details-page',
  templateUrl: './championships-details-page.html',
  styleUrl: './championships-details-page.css',
  imports: [
    RouterLink,
    RouterLinkActive,
    TuiButton,
    TuiHeader,
    TuiTabs,
    TuiTitle,
    RouterOutlet
],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ChampionshipsDetailsPage {
  readonly championship = input.required<Championship>();

  protected readonly tabs = [
    { label: 'Global', url: 'global', icon: '@tui.info' },
    { label: 'Events', url: 'events', icon: '@tui.calendars' },
  ];
}
