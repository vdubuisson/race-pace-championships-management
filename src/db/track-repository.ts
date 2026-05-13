import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Track } from '@/resources/models/track';
import { ResourceLoader } from '@/resources/resource-loader';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class TrackRepository {
  private readonly store = inject(AppDatabase).tracks;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const tracks = await firstValueFrom(this.resourceLoader.loadTracks());
      await this.store.bulkAdd(tracks);
    }
  }

  getTracksByIds(ids: string[]): Promise<Track[]> {
    return this.store.where('id').anyOf(ids).toArray();
  }

  getAllTracks(): Promise<Track[]> {
    return this.store.toArray();
  }
}
