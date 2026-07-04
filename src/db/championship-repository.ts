import { Championship } from '@/shared/models/championship';
import { inject, Service } from '@angular/core';
import { liveQuery } from 'dexie';
import { from, Observable } from 'rxjs';
import { AppDatabase } from './app-database';

@Service()
export class ChampionshipRepository {
  readonly store = inject(AppDatabase).championships;

  getAllChampionships(): Observable<Championship[]> {
    return from(liveQuery(() => this.store.toArray()));
  }

  getChampionshipById(id: number): Promise<Championship | undefined> {
    return this.store.get(id);
  }

  getChampionshipByName(name: string): Promise<Championship | undefined> {
    return this.store.where('name').equalsIgnoreCase(name).first();
  }

  getAllChampionshipsByNames(names: string[]): Promise<Championship[]> {
    return this.store.where('name').anyOfIgnoreCase(names).toArray();
  }

  addChampionship(championship: Championship): Promise<number> {
    return this.store.add(championship);
  }

  async updateChampionship(id: number, championship: Partial<Championship>): Promise<void> {
    await this.store.update(id, championship);
  }

  async deleteChampionship(id: number): Promise<void> {
    await this.store.delete(id);
  }
}
