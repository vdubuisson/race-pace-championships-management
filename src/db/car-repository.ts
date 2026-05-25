import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Car } from '@/resources/models/car';
import { ResourceLoader } from '@/resources/resource-loader';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class CarRepository {
  readonly store = inject(AppDatabase).cars;
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

  async deleteCarsByChampionshipNames(championshipNames: string[]): Promise<void> {
    await this.store.where('championship_name').anyOf(championshipNames).delete();
  }

  async addCars(cars: Car[]): Promise<void> {
    if (cars.length > 0) {
      await this.store.bulkAdd(cars);
    }
  }
}
