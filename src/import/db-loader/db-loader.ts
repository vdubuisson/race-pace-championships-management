import { AppDatabase } from '@/db/app-database';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Driver } from '@/shared/models/driver';
import { Livery } from '@/shared/models/livery';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { VehicleClass } from '@/shared/models/vehicle-class';
import { VehicleModel } from '@/shared/models/vehicle-model';
import { inject, Service } from '@angular/core';
import { Table } from 'dexie';

type ChampionshipsDbData = {
  cars: Car[];
  championships: Championship[];
  drivers: Driver[];
  events: RaceEvent[];
  teams: Team[];
};

type BaseDbData = {
  classes: VehicleClass[];
  tracks: Track[];
  models: VehicleModel[];
  liveries: Livery[];
};

@Service()
export class DbLoader {
  private readonly db = inject(AppDatabase);

  async loadChampionshipsIntoDb(
    { cars, championships, drivers, events, teams }: ChampionshipsDbData,
    isOverwrite: boolean,
  ): Promise<void> {
    const tablesMap: Map<Table, unknown[]> = new Map();
    tablesMap.set(this.db.cars, cars);
    tablesMap.set(this.db.drivers, drivers);
    tablesMap.set(this.db.championships, championships);
    tablesMap.set(this.db.events, events);
    tablesMap.set(this.db.teams, teams);

    return this.loadTables(tablesMap, isOverwrite);
  }

  async loadBaseIntoDb({ tracks, classes, models, liveries }: BaseDbData): Promise<void> {
    const tablesMap: Map<Table, unknown[]> = new Map();
    tablesMap.set(this.db.tracks, tracks);
    tablesMap.set(this.db.classes, classes);
    tablesMap.set(this.db.models, models);
    tablesMap.set(this.db.liveries, liveries);

    return this.loadTables(tablesMap, true);
  }

  private async loadTables(tablesData: Map<Table, unknown[]>, isOverwrite: boolean): Promise<void> {
    return this.db.transaction('rw', Array.from(tablesData.keys()), async () => {
      const promises: Promise<void>[] = [];
      for (const [table, data] of tablesData) {
        promises.push(this.loadTable(table, data, isOverwrite));
      }
      await Promise.all(promises);
    });
  }

  private async loadTable(table: Table, data: unknown[], isOverwrite: boolean): Promise<void> {
    if (isOverwrite) {
      await table.clear();
    } else {
      await this.clearConflictingData(table, data);
    }
    await table.bulkAdd(data);
  }

  private async clearConflictingData(table: Table, data: unknown[]): Promise<void> {
    switch (table.name) {
      case 'championships':
        const championshipNames = (data as Championship[]).map((championship) => championship.name);
        await table.where('name').anyOf(championshipNames).delete();
        break;
      case 'teams':
        const teamNames = (data as Team[]).map((team) => team.name);
        await table.where('name').anyOf(teamNames).delete();
        break;
      case 'cars':
      case 'events':
        const linkedChampionshipNames = (data as Car[] | RaceEvent[]).map(
          (item) => item.championship_name,
        );
        await table.where('championship_name').anyOf(linkedChampionshipNames).delete();
        break;
      default:
        break;
    }
  }
}
