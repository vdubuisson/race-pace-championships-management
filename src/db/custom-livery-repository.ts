import { CustomLivery } from '@/shared/models/livery';
import { inject, Service } from '@angular/core';
import { liveQuery } from 'dexie';
import { from, Observable } from 'rxjs';
import { AppDatabase } from './app-database';

@Service()
export class CustomLiveryRepository {
  private readonly store = inject(AppDatabase).customLiveries;

  getAllCustomLiveries(): Observable<CustomLivery[]> {
    return from(liveQuery(() => this.store.toArray()));
  }

  getCustomLiveriesByFolderNames(folderNames: string[]): Promise<CustomLivery[]> {
    return this.store.where('folder_name').anyOf(folderNames).toArray();
  }

  addAll(customLiveries: CustomLivery[]): Promise<number> {
    return this.store.bulkAdd(customLiveries);
  }

  deleteById(id: number): Promise<void> {
    return this.store.delete(id);
  }
}
