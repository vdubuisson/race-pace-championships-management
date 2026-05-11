import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiCell, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Championship } from '@/resources/models/championship';
import { RaceEventWithTrack } from '@/resources/models/race-event';
import { DurationPipe } from '@/shared/pipes/duration/duration-pipe';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';

@Component({
  selector: 'app-championship-events-tab',
  templateUrl: './championship-events-tab.html',
  styleUrl: './championship-events-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
  imports: [
    DurationPipe,
    MonthPipe,
    OrdinalPipe,
    TuiAvatar,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiIcon,
    TuiTitle,
  ],
})
export default class ChampionshipEventsTab {
  readonly championship = input.required<Championship>();
  readonly events = input.required<RaceEventWithTrack[]>();

  readonly mandatoryEventsCount = computed(
    () => this.events().filter((event) => event.mandatory).length,
  );
  readonly optionalEventsCount = computed(
    () => this.events().filter((event) => !event.mandatory).length,
  );
}
