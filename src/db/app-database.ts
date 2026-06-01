import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Livery } from '@/shared/models/livery';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { VehicleClass } from '@/shared/models/vehicle-class';
import { VehicleModel } from '@/shared/models/vehicle-model';
import { Injectable } from '@angular/core';
import Dexie, { type Table } from 'dexie';

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
        championships: '++id, &name, *categories',
        classes: 'id',
        events: '++id, championship_name',
        liveries: '++id, class',
        models: '++id, class',
        teams: '++id, &name',
        tracks: 'id, location',
      })
      .upgrade((transaction) => {
        transaction.table('cars').clear();
        transaction.table('championships').clear();
        transaction.table('classes').clear();
        transaction.table('events').clear();
        transaction.table('liveries').clear();
        transaction.table('models').clear();
        transaction.table('teams').clear();
        transaction.table('tracks').clear();
      });
  }
}
