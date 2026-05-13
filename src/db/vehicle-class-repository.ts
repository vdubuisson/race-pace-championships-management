import { VehicleClass } from '@/resources/models/vehicle-class';
import { ResourceLoader } from '@/resources/resource-loader';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class VehicleClassRepository {
  private readonly store = inject(AppDatabase).classes;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const classes = await firstValueFrom(this.resourceLoader.loadClasses());
      await this.store.bulkAdd(classes);
    }
  }

  getAllVehicleClasses(): Promise<VehicleClass[]> {
    return this.store.toArray();
  }
}
