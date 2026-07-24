import { Car } from '@/shared/models/car';
import { inject, Service } from '@angular/core';
import { AppDatabase } from './app-database';

@Service()
export class CarRepository {
  readonly store = inject(AppDatabase).cars;

  getAllCars(): Promise<Car[]> {
    return this.store.toArray();
  }

  getCarsByChampionshipName(championshipName: string): Promise<Car[]> {
    return this.store.where('championship_name').equals(championshipName).toArray();
  }

  getCarsByTeamName(teamName: string): Promise<Car[]> {
    return this.store.where('team_name').equals(teamName).toArray();
  }

  getCarsByChampionshipNameAndCategory(championshipName: string, category: string): Promise<Car[]> {
    return this.store.where({ championship_name: championshipName, category }).toArray();
  }

  async updateCarsTeamName(oldTeamName: string, newTeamName: string): Promise<void> {
    const carsIds = (await this.getCarsByTeamName(oldTeamName))
      .map((car) => car.id)
      .filter((id) => id !== undefined);
    const changes = carsIds.map((id) => ({ key: id, changes: { team_name: newTeamName } }));
    await this.store.bulkUpdate(changes);
  }

  async deleteCarsByChampionshipNames(championshipNames: string[]): Promise<void> {
    await this.store.where('championship_name').anyOf(championshipNames).delete();
  }

  async deleteCarsByTeamName(teamName: string): Promise<void> {
    await this.store.where('team_name').equals(teamName).delete();
  }

  async addCars(cars: Car[]): Promise<void> {
    if (cars.length > 0) {
      await this.store.bulkAdd(cars);
    }
  }
}
