import { VehicleModel } from '@/resources/models/vehicle-model';
import { ResourceLoader } from '@/resources/resource-loader';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class ModelRepository {
  private readonly store = inject(AppDatabase).models;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const models = await firstValueFrom(this.resourceLoader.loadModels());
      await this.store.bulkAdd(models);
    }
  }

  async getAllModels(): Promise<VehicleModel[]> {
    return this.store.toArray();
  }
}
