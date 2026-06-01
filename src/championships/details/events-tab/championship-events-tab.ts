import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiCell, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { EventCard } from '../../event-card/event-card';
import { Championship } from '@/shared/models/championship';
import { RaceEventWithTrack } from '@/shared/models/race-event';

@Component({
  selector: 'app-championship-events-tab',
  templateUrl: './championship-events-tab.html',
  styleUrl: './championship-events-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventCard, TuiAvatar, TuiCell, TuiTitle],
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
