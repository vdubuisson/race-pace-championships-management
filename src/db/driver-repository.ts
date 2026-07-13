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

  deleteDriver(id: number): Promise<void> {
    return this.store.delete(id);
  }

  addDriver(driver: Driver): Promise<number> {
    return this.store.add(driver);
  }

  async updateDriver(id: number, driver: Partial<Driver>): Promise<void> {
    await this.store.update(id, driver);
  }
}
