import { Livery } from '@/shared/models/livery';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class LiveryRepository {
  private readonly store = inject(AppDatabase).liveries;

  async getAllLiveries(): Promise<Livery[]> {
    return this.store.toArray();
  }

  async getLiveriesByClasses(classes: string[]): Promise<Livery[]> {
    return this.store.where('class').anyOf(classes).toArray();
  }
}
