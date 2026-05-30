import { CsvParser } from '@/import/csv-parser/csv-parser';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Car } from './models/car';
import { Championship } from './models/championship';
import { Livery } from './models/livery';
import { RaceEvent } from './models/race-event';
import { Team } from './models/team';
import { Track } from './models/track';
import { VehicleClass } from './models/vehicle-class';
import { VehicleModel } from './models/vehicle-model';

@Injectable({ providedIn: 'root' })
export class ResourceLoader {
  private readonly http = inject(HttpClient);
  private readonly csvParser = inject(CsvParser);

  loadChampionships(): Observable<Championship[]> {
    return this.http
      .get('resources/championships.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseChampionships(text)));
  }

  loadCars(): Observable<Car[]> {
    return this.http
      .get('resources/cars.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseCars(text)));
  }

  loadClasses(): Observable<VehicleClass[]> {
    return this.http
      .get('resources/classes.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseClasses(text)));
  }

  loadEvents(): Observable<RaceEvent[]> {
    return this.http
      .get('resources/events.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseEvents(text)));
  }

  loadLiveries(): Observable<Livery[]> {
    return this.http
      .get('resources/liveries.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseLiveries(text)));
  }

  loadModels(): Observable<VehicleModel[]> {
    return this.http
      .get('resources/models.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseModels(text)));
  }

  loadTeams(): Observable<Team[]> {
    return this.http
      .get('resources/teams.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseTeams(text)));
  }

  loadTracks(): Observable<Track[]> {
    return this.http
      .get('resources/tracks.csv', { responseType: 'text' })
      .pipe(map((text) => this.csvParser.parseTracks(text)));
  }
}
