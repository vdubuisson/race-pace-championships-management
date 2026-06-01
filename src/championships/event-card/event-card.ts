import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TuiButton, TuiCell, TuiGroup, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { RaceEventWithTrack } from '@/shared/models/race-event';
import { DurationPipe } from '@/shared/pipes/duration/duration-pipe';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DurationPipe,
    MonthPipe,
    OrdinalPipe,
    TuiAvatar,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiGroup,
    TuiHeader,
    TuiIcon,
    TuiTitle,
  ],
})
export class EventCard {
  readonly event = input.required<RaceEventWithTrack>();
  readonly editable = input(false);

  readonly delete = output<void>();
  readonly edit = output<void>();
}
