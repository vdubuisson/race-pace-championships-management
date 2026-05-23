import { Injectable } from '@angular/core';
import Dexie, { type Table } from 'dexie';
import { Car } from '@/resources/models/car';
import { Championship } from '@/resources/models/championship';
import { VehicleClass } from '@/resources/models/vehicle-class';
import { RaceEvent } from '@/resources/models/race-event';
import { Livery } from '@/resources/models/livery';
import { VehicleModel } from '@/resources/models/vehicle-model';
import { Team } from '@/resources/models/team';
import { Track } from '@/resources/models/track';

type SaveChampionshipPayload = {
  championship: Championship;
  events: Omit<RaceEvent, 'championship_name'>[];
  cars: Omit<Car, 'championship_name'>[];
  id?: number;
  previousName?: string;
};

@Injectable({ providedIn: 'root' })
export class AppDatabase extends Dexie {
  cars!: Table<Car, number>;
  championships!: Table<Championship, number>;
  classes!: Table<VehicleClass, string>;
  events!: Table<RaceEvent, number>;
  liveries!: Table<Livery, number>;
  models!: Table<VehicleModel, number>;
  teams!: Table<Team, number>;
  tracks!: Table<Track, string>;

  constructor() {
    super('RacePaceChampionshipsManagementDB');
    this.version(1).stores({
      cars: '++id, team_name, *championship_names',
      championships: '++id, name, *categories',
      classes: 'name',
      events: '++id, championship_name',
      liveries: '++id, class',
      models: '++id, class, aiOnly, isMod',
      teams: '++id, name',
      tracks: 'id, is_mod',
    });
    this.version(2)
      .stores({
        cars: '++id, team_name, championship_name',
        championships: '++id, name, *categories',
        classes: 'id',
        events: '++id, championship_name',
        liveries: '++id, class',
        models: '++id, class, aiOnly, isMod',
        teams: '++id, name',
        tracks: 'id, is_mod, location',
      })
      .upgrade((transaction) => {
        transaction.table('cars').clear();
        transaction.table('classes').clear();
        transaction.table('events').clear();
        transaction.table('teams').clear();
        transaction.table('tracks').clear();
      });
  }

  // TODO Voir pour déplacer dans repositories
  async saveChampionshipWithRelations({
    championship,
    events,
    cars,
    id,
    previousName,
  }: SaveChampionshipPayload): Promise<number> {
    let championshipId = id;

    await this.transaction('rw', this.championships, this.events, this.cars, async () => {
      if (typeof championshipId === 'number') {
        await this.championships.update(championshipId, championship);
      } else {
        championshipId = await this.championships.add(championship);
      }

      const namesToClear = new Set<string>([championship.name]);
      if (previousName) {
        namesToClear.add(previousName);
      }

      for (const name of namesToClear) {
        await this.events.where('championship_name').equals(name).delete();
        await this.cars.where('championship_name').equals(name).delete();
      }

      if (events.length > 0) {
        await this.events.bulkAdd(
          events.map((event) => ({ ...event, championship_name: championship.name })),
        );
      }

      if (cars.length > 0) {
        await this.cars.bulkAdd(
          cars.map((car) => ({ ...car, championship_name: championship.name })),
        );
      }
    });

    if (typeof championshipId !== 'number') {
      throw new Error('Failed to persist championship');
    }

    return championshipId;
  }
}
