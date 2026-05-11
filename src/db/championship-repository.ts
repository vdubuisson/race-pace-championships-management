import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';
import { ResourceLoader } from '@/resources/resource-loader';
import { firstValueFrom, from, Observable } from 'rxjs';
import { liveQuery } from 'dexie';
import { Championship } from '@/resources/models/championship';

@Injectable({ providedIn: 'root' })
export class ChampionshipRepository {
  private readonly store = inject(AppDatabase).championships;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const championships = await firstValueFrom(this.resourceLoader.loadChampionships());
      await this.store.bulkAdd(championships);
    }
  }

  getAllChampionships(): Observable<Championship[]> {
    return from(liveQuery(() => this.store.toArray()));
  }

  getChampionshipById(id: number): Promise<Championship | undefined> {
    return this.store.get(id);
  }
}
