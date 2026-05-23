import { Livery } from '@/resources/models/livery';
import { ResourceLoader } from '@/resources/resource-loader';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class LiveryRepository {
  private readonly store = inject(AppDatabase).liveries;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const liveries = await firstValueFrom(this.resourceLoader.loadLiveries());
      await this.store.bulkAdd(liveries);
    }
  }

  async getAllLiveries(): Promise<Livery[]> {
    const liveries = await this.store.toArray();
    return liveries.filter((livery) => livery.ai_only === false);
  }

  async getLiveriesByClasses(classes: string[]): Promise<Livery[]> {
    const liveries = await this.store.where('class').anyOf(classes).toArray();
    return liveries.filter((livery) => livery.ai_only === false);
  }
}
