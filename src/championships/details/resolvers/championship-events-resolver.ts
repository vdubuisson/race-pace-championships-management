import { EventRepository } from '@/db/event-repository';
import { TrackRepository } from '@/db/track-repository';
import { Championship } from '@/shared/models/championship';
import { RaceEventWithTrack } from '@/shared/models/race-event';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const championshipEventsResolver: ResolveFn<RaceEventWithTrack[]> = async (route) => {
  const eventRepository = inject(EventRepository);
  const trackRepository = inject(TrackRepository);
  const championshipName = (route.data['championship'] as Championship).name;
  const events = await eventRepository.getEventsByChampionshipName(championshipName);
  const trackIds = new Set<string>();
  for (const event of events) {
    trackIds.add(event.track_id);
  }
  const tracks = await trackRepository.getTracksByIds(Array.from(trackIds));
  const tracksById = new Map(tracks.map((track) => [track.id, track]));
  return events.map((event) => ({
    ...event,
    track_name: tracksById.get(event.track_id)?.name ?? 'Unknown track',
    is_mod: tracksById.get(event.track_id)?.is_mod ?? false,
  }));
};
