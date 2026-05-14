import { EventCard } from '@/championships/event-card/event-card';
import { RaceEvent, RaceEventWithTrack } from '@/resources/models/race-event';
import { Track } from '@/resources/models/track';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { TuiButton, TuiCell, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { ChampionshipEventForm } from './event-form/championship-event-form';

@Component({
  selector: 'app-championship-events-step',
  templateUrl: './championship-events-step.html',
  styleUrl: './championship-events-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChampionshipEventForm, EventCard, TuiButton, TuiCell, TuiTitle],
})
export class ChampionshipEventsStep {
  private readonly notifications = inject(TuiNotificationService);

  readonly tracks = input.required<Track[]>();
  readonly requiredEventCount = input.required<number>();
  readonly events = model<RaceEvent[]>([]);

  readonly tracksNameById = computed(
    () => new Map(this.tracks().map((track) => [track.id, track.name])),
  );

  readonly eventsWithTrack = computed<RaceEventWithTrack[]>(() =>
    this.events()
      .map((event) => ({
        ...event,
        track_name: this.tracksNameById().get(event.track_id) ?? '',
      }))
      .toSorted((a, b) => {
        if (a.month !== b.month) {
          return a.month - b.month;
        }

        if (a.week_end !== b.week_end) {
          return a.week_end - b.week_end;
        }

        return a.id! - b.id!;
      }),
  );

  protected readonly isFormShown = signal(false);
  protected readonly editedEvent = signal<RaceEvent | null>(null);

  protected hideForm(): void {
    this.isFormShown.set(false);
    this.editedEvent.set(null);
  }

  protected openNewForm(): void {
    this.editedEvent.set(null);
    this.isFormShown.set(true);
  }

  protected submitForm(formEvent: RaceEvent): void {
    if (formEvent.id) {
      this.events.update((events) =>
        events.map((event) => (event.id === formEvent.id ? formEvent : event)),
      );
      this.notifications
        .open('Event updated', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
    } else {
      const tempId = -this.events().length;
      this.events.update((events) => [...events, { ...formEvent, id: tempId }]);
      this.notifications
        .open('Event added', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
    }
    this.hideForm();
  }

  protected deleteEvent(eventToDelete: RaceEvent): void {
    this.events.update((events) => events.filter((event) => event.id !== eventToDelete.id));
    this.notifications
      .open('Event deleted', {
        appearance: 'positive',
        autoClose: 3000,
        closable: false,
      })
      .subscribe();
  }

  protected openEventEdition(event: RaceEvent): void {
    this.editedEvent.set(event);
    this.isFormShown.set(true);
  }
}
