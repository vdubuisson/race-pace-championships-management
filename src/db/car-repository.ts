import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Car } from '@/resources/models/car';
import { ResourceLoader } from '@/resources/resource-loader';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class CarRepository {
  private readonly store = inject(AppDatabase).cars;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const cars = await firstValueFrom(this.resourceLoader.loadCars());
      await this.store.bulkAdd(cars);
    }
  }

  getCarsByChampionshipName(championshipName: string): Promise<Car[]> {
    return this.store.where('championship_name').equals(championshipName).toArray();
  }
}
