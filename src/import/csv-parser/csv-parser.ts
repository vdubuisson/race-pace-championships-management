import { Car, CsvCar } from '@/resources/models/car';
import { Championship } from '@/resources/models/championship';
import { Livery } from '@/resources/models/livery';
import { RaceEvent } from '@/resources/models/race-event';
import { Team } from '@/resources/models/team';
import { Track } from '@/resources/models/track';
import { VehicleClass } from '@/resources/models/vehicle-class';
import { VehicleModel } from '@/resources/models/vehicle-model';
import { Injectable } from '@angular/core';
import { parse } from 'csv-parse/browser/esm/sync';
import { CsvValidationError } from '../validators/csv-validation-error';

const EXPECTED_HEADERS: Record<string, string[]> = {
  'cars.csv': [
    'team_name',
    'category',
    'model',
    'livery',
    'championship_names',
    'livery_id',
    'model_folder',
  ],
  'championships.csv': [
    'name',
    'categories',
    'prestige',
    'init_month',
    'init_day',
    'registration_start_month',
    'registration_start_day',
    'registration_end_month',
    'registration_end_day',
    'points',
    'pit_stop',
    'start_type',
    'field_type',
    'events_count',
    'tags',
    'start_year',
    'end_year',
    'default_included',
  ],
  'events.csv': [
    'championship_name',
    'track_id',
    'name',
    'month',
    'week_end',
    'mandatory',
    'type',
    'duration',
    'start_time',
  ],
  'teams.csv': ['name', 'elo', 'principal', 'driver_loyalty', 'expectation_level'],
};

@Injectable({ providedIn: 'root' })
export class CsvParser {
  parseCars(text: string): Car[] {
    this.validateHeaders('cars.csv', text);
    const rows = parse(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.header) return value;
        switch (context.column) {
          case 'championship_names':
            return value
              .split(',')
              .map((s) => s.trim())
              .filter((name) => name.length > 0);
          case 'livery_id':
            return Number(value);
          default:
            return value;
        }
      },
    }) as CsvCar[];

    return rows.flatMap(({ championship_names, ...car }) =>
      championship_names.map((championship_name) => ({
        ...car,
        championship_name,
      })),
    );
  }

  parseChampionships(text: string): Championship[] {
    this.validateHeaders('championships.csv', text);
    return parse(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.header) return value;
        switch (context.column) {
          case 'categories':
          case 'tags':
            return value.split(',').map((s) => s.trim());
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
            if (value === '') return null;
            return Number(value);
          case 'points':
            return value.split(',').map((s) => Number(s.trim()));
          case 'pit_stop':
          case 'default_included':
            return value.toLowerCase() === 'true';
          case 'field_type':
            return value.trim() === '' ? null : value;
          default:
            return value;
        }
      },
    }) as Championship[];
  }

  parseEvents(text: string): RaceEvent[] {
    this.validateHeaders('events.csv', text);
    return parse(text, {
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
          case 'start_time':
            return value.trim() === '' ? null : value;
          default:
            return value;
        }
      },
    }) as RaceEvent[];
  }

  parseTeams(text: string): Team[] {
    this.validateHeaders('teams.csv', text);
    return parse(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.header) return value;
        switch (context.column) {
          case 'elo':
          case 'driver_loyalty':
          case 'expectation_level':
            if (value === '') return null;
            return Number(value);
          default:
            return value;
        }
      },
    }) as Team[];
  }

  parseTracks(text: string): Track[] {
    return parse(text, {
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
      },
    }) as Track[];
  }

  parseModels(text: string): VehicleModel[] {
    return parse(text, {
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
      },
    }) as VehicleModel[];
  }

  parseLiveries(text: string): Livery[] {
    return parse(text, {
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
      },
    }) as Livery[];
  }

  parseClasses(text: string): VehicleClass[] {
    return parse(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.header) return value;
        switch (context.column) {
          case 'name':
            return value.trim() === '' ? null : value;
          default:
            return value;
        }
      },
    }) as VehicleClass[];
  }

  private validateHeaders(fileName: string, text: string): void {
    const expected = EXPECTED_HEADERS[fileName];
    if (!expected) return;

    const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0];
    if (!firstLine) {
      throw new CsvValidationError(fileName, `File "${fileName}" is empty`);
    }

    const actual = firstLine.split(',').map((h) => h.trim());
    const missing = expected.filter((h) => !actual.includes(h));
    const unexpected = actual.filter((h) => !expected.includes(h));

    if (missing.length > 0 || unexpected.length > 0) {
      const parts: string[] = [];
      if (missing.length > 0) parts.push(`Missing columns: ${missing.join(', ')}`);
      if (unexpected.length > 0) parts.push(`Unexpected columns: ${unexpected.join(', ')}`);
      throw new CsvValidationError(
        fileName,
        `Invalid structure in "${fileName}". ${parts.join('. ')}`,
      );
    }
  }
}
