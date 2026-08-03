import { inject, Service } from '@angular/core';
import { AppDatabase } from './app-database';
import { from, Observable } from 'rxjs';
import { Driver } from '@/shared/models/driver';
import { liveQuery } from 'dexie';

@Service()
export class DriverRepository {
  readonly store = inject(AppDatabase).drivers;

  getAllDrivers(): Observable<Driver[]> {
    return from(liveQuery(() => this.store.toArray()));
  }

  getDriverById(id: number): Promise<Driver | undefined> {
    return this.store.get(id);
  }

  getDriversByTeamName(teamName: string): Promise<Driver[]> {
    return this.store.where('team_name').equals(teamName).toArray();
  }

  getDriversByChampionshipName(championshipName: string): Promise<Driver[]> {
    return this.store.where('championship_name').equals(championshipName).toArray();
  }

  getDriversByChampionshipNames(championshipNames: string[]): Promise<Driver[]> {
    return this.store.where('championship_name').anyOf(championshipNames).toArray();
  }

  deleteDriver(id: number): Promise<void> {
    return this.store.delete(id);
  }

  addDriver(driver: Driver): Promise<number> {
    return this.store.add(driver);
  }

  async updateDriver(id: number, driver: Partial<Driver>): Promise<void> {
    await this.store.update(id, driver);
  }

  async updateDriversTeamName(oldTeamName: string, newTeamName: string): Promise<void> {
    const driversIds = (await this.getDriversByTeamName(oldTeamName))
      .map((driver) => driver.id)
      .filter((id) => id !== undefined);
    const changes = driversIds.map((id) => ({ key: id, changes: { team_name: newTeamName } }));
    await this.store.bulkUpdate(changes);
  }

  async updateDriversChampionshipName(
    oldChampionshipName: string,
    newChampionshipName: string,
  ): Promise<void> {
    const driversIds = (await this.getDriversByChampionshipName(oldChampionshipName))
      .map((driver) => driver.id)
      .filter((id) => id !== undefined);
    const changes = driversIds.map((id) => ({
      key: id,
      changes: { championship_name: newChampionshipName },
    }));
    await this.store.bulkUpdate(changes);
  }

  async deleteDriversByTeamName(teamName: string): Promise<void> {
    await this.store.where('team_name').equals(teamName).delete();
  }

  async deleteDriversByChampionshipName(championshipName: string): Promise<void> {
    await this.store.where('championship_name').equals(championshipName).delete();
  }
}
