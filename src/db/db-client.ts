import { Injectable, inject, signal } from '@angular/core';
import { ResourceLoader } from '../resources/resource-loader';
import { firstValueFrom } from 'rxjs';

const DB_NAME = 'race-pace-db';
const DB_VERSION = 1;

const STORE_CONFIGS: Record<string, IDBObjectStoreParameters> = {
  cars: { autoIncrement: true },
  championships: { keyPath: 'name' },
  classes: { keyPath: 'name' },
  events: { autoIncrement: true },
  liveries: { autoIncrement: true },
  models: { autoIncrement: true },
  teams: { keyPath: 'name' },
  tracks: { keyPath: 'id' },
};

const RESOURCES = Object.keys(STORE_CONFIGS);

@Injectable({ providedIn: 'root' })
export class DbClient {
  private readonly resourceLoader = inject(ResourceLoader);

  private db: IDBDatabase | null = null;

  readonly isReady = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async initialize(): Promise<void> {
    if (this.isReady()) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      this.db = await this.openDatabase();
      await Promise.all(RESOURCES.map((name) => this.loadResourceIfEmpty(name)));
      this.isReady.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  // getAll<K extends ResourceName>(storeName: K): Promise<ResourceTypeMap[K][]> {
  //   return new Promise((resolve, reject) => {
  //     if (!this.db) {
  //       reject(new Error('Database is not initialized. Call initialize() first.'));
  //       return;
  //     }

  //     const tx = this.db.transaction(storeName, 'readonly');
  //     const store = tx.objectStore(storeName);
  //     const request = store.getAll();

  //     request.onsuccess = () => resolve(request.result as ResourceTypeMap[K][]);
  //     request.onerror = () => reject(request.error);
  //   });
  // }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        for (const [name, config] of Object.entries(STORE_CONFIGS)) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, config);
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async loadResourceIfEmpty(name: string): Promise<void> {
    const count = await this.countRecords(name);
    if (count > 0) return;

    let records: unknown[];

    switch (name) {
      case 'championships':
        records = await firstValueFrom(this.resourceLoader.loadChampionships());
        break;
      case 'cars':
        records = await firstValueFrom(this.resourceLoader.loadCars());
        break;
      case 'classes':
        records = await firstValueFrom(this.resourceLoader.loadClasses());
        break;
      case 'events':
        records = await firstValueFrom(this.resourceLoader.loadEvents());
        break;
      case 'liveries':
        records = await firstValueFrom(this.resourceLoader.loadLiveries());
        break;
      case 'models':
        records = await firstValueFrom(this.resourceLoader.loadModels());
        break;
      case 'teams':
        records = await firstValueFrom(this.resourceLoader.loadTeams());
        break;
      case 'tracks':
        records = await firstValueFrom(this.resourceLoader.loadTracks());
        break;
      default:
        throw new Error(`Unknown resource: ${name}`);
    }
    await this.storeRecords(name, records);
  }

  private countRecords(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private storeRecords(storeName: string, records: unknown[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const record of records) {
        store.put(record);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
