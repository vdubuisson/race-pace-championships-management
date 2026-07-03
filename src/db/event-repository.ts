import { RaceEvent } from '@/shared/models/race-event';
import { inject, Service } from '@angular/core';
import { AppDatabase } from './app-database';

@Service()
export class EventRepository {
  readonly store = inject(AppDatabase).events;

  getAllEvents(): Promise<RaceEvent[]> {
    return this.store.toArray();
  }

  getEventsByChampionshipName(championshipName: string): Promise<RaceEvent[]> {
    return this.store.where('championship_name').equals(championshipName).toArray();
  }

  async deleteEventsByChampionshipNames(championshipNames: string[]): Promise<void> {
    await this.store.where('championship_name').anyOf(championshipNames).delete();
  }

  async addEvents(events: RaceEvent[]): Promise<void> {
    if (events.length > 0) {
      await this.store.bulkAdd(events);
    }
  }
}
