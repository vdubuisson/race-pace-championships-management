import { VehicleClass } from '@/shared/models/vehicle-class';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class VehicleClassRepository {
  private readonly store = inject(AppDatabase).classes;

  getAllVehicleClasses(): Promise<VehicleClass[]> {
    return this.store.toArray();
  }

  getVehicleClassesByIds(ids: string[]): Promise<VehicleClass[]> {
    return this.store.where('id').anyOf(ids).toArray();
  }
}
