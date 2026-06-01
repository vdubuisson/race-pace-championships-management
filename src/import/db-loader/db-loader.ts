import { AppDatabase } from '@/db/app-database';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Livery } from '@/shared/models/livery';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { VehicleClass } from '@/shared/models/vehicle-class';
import { VehicleModel } from '@/shared/models/vehicle-model';
import { inject, Injectable } from '@angular/core';
import { Table } from 'dexie';

type ChampionshipsDbData = {
  cars: Car[];
  championships: Championship[];
  events: RaceEvent[];
  teams: Team[];
};

type BaseDbData = {
  classes: VehicleClass[];
  tracks: Track[];
  models: VehicleModel[];
  liveries: Livery[];
};

@Injectable({ providedIn: 'root' })
export class DbLoader {
  private readonly db = inject(AppDatabase);

  async loadChampionshipsIntoDb({
    cars,
    championships,
    events,
    teams,
  }: ChampionshipsDbData): Promise<void> {
    const tablesMap: Map<Table, unknown[]> = new Map();
    tablesMap.set(this.db.cars, cars);
    tablesMap.set(this.db.championships, championships);
    tablesMap.set(this.db.events, events);
    tablesMap.set(this.db.teams, teams);

    return this.loadTables(tablesMap);
  }

  async loadBaseIntoDb({ tracks, classes, models, liveries }: BaseDbData): Promise<void> {
    const tablesMap: Map<Table, unknown[]> = new Map();
    tablesMap.set(this.db.tracks, tracks);
    tablesMap.set(this.db.classes, classes);
    tablesMap.set(this.db.models, models);
    tablesMap.set(this.db.liveries, liveries);

    return this.loadTables(tablesMap);
  }

  private async loadTables(tablesData: Map<Table, unknown[]>): Promise<void> {
    return this.db.transaction('rw', Array.from(tablesData.keys()), async () => {
      const promises: Promise<void>[] = [];
      for (const [table, data] of tablesData) {
        promises.push(this.loadTable(table, data));
      }
      await Promise.all(promises);
    });
  }

  private async loadTable(table: Table, data: unknown[]): Promise<void> {
    await table.clear();
    await table.bulkAdd(data);
  }
}
