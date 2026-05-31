import { Track } from '@/shared/models/track';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class TrackRepository {
  private readonly store = inject(AppDatabase).tracks;

  getTracksByIds(ids: string[]): Promise<Track[]> {
    return this.store.where('id').anyOf(ids).toArray();
  }

  getAllTracks(): Promise<Track[]> {
    return this.store.toArray();
  }
}
