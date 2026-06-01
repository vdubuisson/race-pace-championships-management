import { Car } from '@/shared/models/car';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class CarRepository {
  readonly store = inject(AppDatabase).cars;

  getAllCars(): Promise<Car[]> {
    return this.store.toArray();
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
