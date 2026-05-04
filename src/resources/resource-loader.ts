import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { parse } from 'csv-parse/browser/esm/sync';
import { map, Observable } from 'rxjs';
import { Championship } from './models/championship';
import { Car } from './models/car';
import { VehicleClass } from './models/vehicle-class';
import { RaceEvent } from './models/race-event';
import { Livery } from './models/livery';
import { VehicleModel } from './models/vehicle-model';
import { Team } from './models/team';
import { Track } from './models/track';

@Injectable({ providedIn: 'root' })
export class ResourceLoader {
  private readonly http = inject(HttpClient);

  loadChampionships(): Observable<Championship[]> {
    return this.http.get('/resources/championships.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'categories':
              case 'tags':
                return new Set(value.split(',').map((s) => s.trim()));
              case 'prestige':
              case 'init_month':
              case 'init_day':
              case 'registration_start_month':
              case 'registration_start_day':
              case 'registration_end_month':
              case 'registration_end_day':
              case 'events_count':
              case 'start_year':
              case 'end_year':
                return Number(value);
              case 'points':
                return value.split(',').map((s) => Number(s.trim()));
              case 'pit_stop':
                return value.toLowerCase() === 'true';
              case 'field_type':
                return value === '' ? null : value;
              default:
                return value;
            }
          }
        }) as Championship[]
      )
    );
  }

  loadCars(): Observable<Car[]> {
    return this.http.get('/resources/cars.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'championship_names':
                return new Set(value.split(',').map((s) => s.trim()));
              case 'livery_id':
                return Number(value);
              default:
                return value;
            }
          }
        }) as Car[]
      )
    );
  }

  loadClasses(): Observable<VehicleClass[]> {
    return this.http.get('/resources/classes.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true
        }) as VehicleClass[]
      )
    );
  }

  loadEvents(): Observable<RaceEvent[]> {
    return this.http.get('/resources/events.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'month':
              case 'week_end':
              case 'duration':
                return Number(value);
              case 'mandatory':
                return value.toLowerCase() === 'true';
              default:
                return value;
            }
          }
        }) as RaceEvent[]
      )
    );
  }

  loadLiveries(): Observable<Livery[]> {
    return this.http.get('/resources/liveries.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'livery_id':
                return Number(value);
              case 'ai_only':
              case 'is_mod':
                return value.toLowerCase() === 'true';
              default:
                return value;
            }
          }
        }) as Livery[]
      )
    );
  }

  loadModels(): Observable<VehicleModel[]> {
    return this.http.get('/resources/models.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'year':
                return Number(value);
              default:
                return value;
            }
          }
        }) as VehicleModel[]
      )
    );
  }

  loadTeams(): Observable<Team[]> {
    return this.http.get('/resources/teams.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'elo':
              case 'driver_loyalty':
              case 'expectation_delta':
                return Number(value);
              default:
                return value;
            }
          }
        }) as Team[]
      )
    );
  }

  loadTracks(): Observable<Track[]> {
    return this.http.get('/resources/tracks.csv', { responseType: 'text' }).pipe(
      map((text) =>
        parse(text, {
          bom: true,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            if (context.header) return value;
            switch (context.column) {
              case 'grade':
              case 'garages':
              case 'length':
              case 'turns':
              case 'start_year':
              case 'end_year':
                return Number(value);
              case 'is_mod':
                return value.toLowerCase() === 'true';
              default:
                return value;
            }
          }
        }) as Track[]
      )
    );
  }
}
