import { Championship } from '@/resources/models/championship';
import { ResourceLoader } from '@/resources/resource-loader';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppDatabase } from './app-database';

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

  getAllChampionships(): Promise<Championship[]> {
    return this.store.toArray();
  }

  getChampionshipById(id: number): Promise<Championship | undefined> {
    return this.store.get(id);
  }

  getChampionshipByName(name: string): Promise<Championship | undefined> {
    return this.store.where('name').equalsIgnoreCase(name).first();
  }

  addChampionship(championship: Championship): Promise<number> {
    return this.store.add(championship);
  }

  async updateChampionship(id: number, championship: Partial<Championship>): Promise<void> {
    await this.store.update(id, championship);
  }
}
