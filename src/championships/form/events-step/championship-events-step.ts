import { EventCard } from '@/championships/event-card/event-card';
import { RaceEvent, RaceEventWithTrack } from '@/shared/models/race-event';
import { Track } from '@/shared/models/track';
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

  readonly eventsWithTrack = computed<RaceEventWithTrack[]>(() => {
    const eventsWithTrack = [];
    for (const event of this.events()) {
      const track = this.tracks().find((track) => track.id === event.track_id);
      if (track) {
        eventsWithTrack.push({
          ...event,
          track_name: track.name,
          is_mod: track.is_mod,
        });
      }
    }
    return eventsWithTrack.toSorted((a, b) => {
      if (a.month !== b.month) {
        return a.month - b.month;
      }

      if (a.week_end !== b.week_end) {
        return a.week_end - b.week_end;
      }

      return a.id! - b.id!;
    });
  });

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
      const tempId = -this.events().length - 1;
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
