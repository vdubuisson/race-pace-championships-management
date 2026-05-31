import { Livery } from '@/shared/models/livery';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class LiveryRepository {
  private readonly store = inject(AppDatabase).liveries;

  async getAllLiveries(): Promise<Livery[]> {
    const liveries = await this.store.toArray();
    return liveries.filter((livery) => livery.ai_only === false);
  }

  async getLiveriesByClasses(classes: string[]): Promise<Livery[]> {
    const liveries = await this.store.where('class').anyOf(classes).toArray();
    return liveries.filter((livery) => livery.ai_only === false);
  }
}
