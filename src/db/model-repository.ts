import { VehicleModel } from '@/shared/models/vehicle-model';
import { inject, Service } from '@angular/core';
import { AppDatabase } from './app-database';

@Service()
export class ModelRepository {
  private readonly store = inject(AppDatabase).models;

  async getAllModels(): Promise<VehicleModel[]> {
    return this.store.toArray();
  }
}
