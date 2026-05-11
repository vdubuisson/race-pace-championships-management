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

const DB_VERSION = 1;

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
    this.version(DB_VERSION).stores({
      cars: '++id, team_name, *championship_names',
      championships: '++id, name, *categories',
      classes: 'name',
      events: '++id, championship_name',
      liveries: '++id, class',
      models: '++id, class, aiOnly, isMod',
      teams: '++id, name',
      tracks: 'id, is_mod',
    });
  }
}
