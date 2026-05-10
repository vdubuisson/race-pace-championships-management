import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RaceEvent } from '../resources/models/race-event';
import { ResourceLoader } from '../resources/resource-loader';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class EventRepository {
  private readonly store = inject(AppDatabase).events;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const events = await firstValueFrom(this.resourceLoader.loadEvents());
      await this.store.bulkAdd(events);
    }
  }

  getEventsByChampionshipName(championshipName: string): Promise<RaceEvent[]> {
    return this.store.where('championship_name').equals(championshipName).toArray();
  }
}
