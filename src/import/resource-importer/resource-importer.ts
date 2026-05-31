import { CsvParser } from '@/import/csv-parser/csv-parser';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Livery } from '@/shared/models/livery';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { VehicleClass } from '@/shared/models/vehicle-class';
import { VehicleModel } from '@/shared/models/vehicle-model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { DbLoader } from '../db-loader/db-loader';

const BASE_RESOURCE_PATH = 'base';
const ORIGINAL_RESOURCE_PATH = 'original';
const BLITZER_MODDED_RESOURCE_PATH = 'blitzer-modded';
const BLITZER_NO_MODS_RESOURCE_PATH = 'blitzer-no-mods';

@Injectable({ providedIn: 'root' })
export class ResourceImporter {
  private readonly http = inject(HttpClient);
  private readonly csvParser = inject(CsvParser);
  private readonly dbLoader = inject(DbLoader);

  importOriginalChampionships(): Observable<void> {
    return this.importChampionshipsResources(ORIGINAL_RESOURCE_PATH);
  }

  importBlitzerModdedChampionships(): Observable<void> {
    return this.importChampionshipsResources(BLITZER_MODDED_RESOURCE_PATH);
  }

  importBlitzerNoModsChampionships(): Observable<void> {
    return this.importChampionshipsResources(BLITZER_NO_MODS_RESOURCE_PATH);
  }

  getRemoteBaseResourcesVersion(): Observable<number> {
    return this.http
      .get(`resources/${BASE_RESOURCE_PATH}/version.txt`, { responseType: 'text' })
      .pipe(map((text) => parseInt(text)));
  }

  importBaseResources(): Observable<void> {
    return forkJoin({
      tracks: this.loadBaseTracks(),
      classes: this.loadBaseClasses(),
      models: this.loadBaseModels(),
      liveries: this.loadBaseLiveries(),
    }).pipe(
      switchMap(({ tracks, classes, models, liveries }) => {
        return this.dbLoader.loadBaseIntoDb({
          tracks,
          classes,
          models,
          liveries,
        });
      }),
    );
  }

  private importChampionshipsResources(path: string): Observable<void> {
    return forkJoin({
      championships: this.loadChampionships(path),
      cars: this.loadCars(path),
      events: this.loadEvents(path),
      teams: this.loadTeams(path),
    }).pipe(
      switchMap(({ championships, cars, events, teams }) => {
        return this.dbLoader.loadChampionshipsIntoDb({
          cars,
          championships,
          events,
          teams,
        });
      }),
    );
  }

  private loadChampionships(path: string): Observable<Championship[]> {
    return this.http
      .get(`resources/${path}/championships.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseChampionships(text)));
  }

  private loadCars(path: string): Observable<Car[]> {
    return this.http
      .get(`resources/${path}/cars.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseCars(text)));
  }

  private loadEvents(path: string): Observable<RaceEvent[]> {
    return this.http
      .get(`resources/${path}/events.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseEvents(text)));
  }

  private loadTeams(path: string): Observable<Team[]> {
    return this.http
      .get(`resources/${path}/teams.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseTeams(text)));
  }

  private loadBaseTracks(): Observable<Track[]> {
    return this.http
      .get(`resources/${BASE_RESOURCE_PATH}/tracks.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseTracks(text)));
  }

  private loadBaseClasses(): Observable<VehicleClass[]> {
    return this.http
      .get(`resources/${BASE_RESOURCE_PATH}/classes.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseClasses(text)));
  }

  private loadBaseModels(): Observable<VehicleModel[]> {
    return this.http
      .get(`resources/${BASE_RESOURCE_PATH}/models.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseModels(text)));
  }

  private loadBaseLiveries(): Observable<Livery[]> {
    return this.http
      .get(`resources/${BASE_RESOURCE_PATH}/liveries.csv`, { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseLiveries(text)));
  }
}
