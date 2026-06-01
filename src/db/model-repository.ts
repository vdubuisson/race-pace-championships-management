import { VehicleModel } from '@/shared/models/vehicle-model';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class ModelRepository {
  private readonly store = inject(AppDatabase).models;

  async getAllModels(): Promise<VehicleModel[]> {
    return this.store.toArray();
  }
}
