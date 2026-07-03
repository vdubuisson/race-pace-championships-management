import { VehicleClass } from '@/shared/models/vehicle-class';
import { inject, Service } from '@angular/core';
import { AppDatabase } from './app-database';

@Service()
export class VehicleClassRepository {
  private readonly store = inject(AppDatabase).classes;

  getAllVehicleClasses(): Promise<VehicleClass[]> {
    return this.store.toArray();
  }

  getVehicleClassesByIds(ids: string[]): Promise<VehicleClass[]> {
    return this.store.where('id').anyOf(ids).toArray();
  }
}
