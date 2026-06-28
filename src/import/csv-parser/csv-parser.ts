import { Car, CsvCar } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Livery } from '@/shared/models/livery';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { VehicleClass } from '@/shared/models/vehicle-class';
import { VehicleModel } from '@/shared/models/vehicle-model';
import { Injectable } from '@angular/core';
import { parse } from 'csv-parse/browser/esm/sync';
import { CsvValidationError } from '../import-custom/validators/csv-validation-error';

type CsvHeader = {
  name: string;
  mandatory: boolean;
};

type CsvFile = 'cars.csv' | 'championships.csv' | 'events.csv' | 'teams.csv';

const EXPECTED_HEADERS: Record<CsvFile, CsvHeader[]> = {
  'cars.csv': [
    { name: 'team_name', mandatory: true },
    { name: 'category', mandatory: true },
    { name: 'model', mandatory: true },
    { name: 'livery', mandatory: true },
    { name: 'championship_names', mandatory: true },
    { name: 'livery_id', mandatory: true },
    { name: 'model_folder', mandatory: true },
  ],
  'championships.csv': [
    { name: 'name', mandatory: true },
    { name: 'categories', mandatory: true },
    { name: 'prestige', mandatory: true },
    { name: 'init_month', mandatory: true },
    { name: 'init_day', mandatory: true },
    { name: 'registration_start_month', mandatory: true },
    { name: 'registration_start_day', mandatory: true },
    { name: 'registration_end_month', mandatory: true },
    { name: 'registration_end_day', mandatory: true },
    { name: 'points', mandatory: true },
    { name: 'pit_stop', mandatory: false },
    { name: 'start_type', mandatory: true },
    { name: 'field_type', mandatory: false },
    { name: 'parc_ferme', mandatory: false },
    { name: 'events_count', mandatory: true },
    { name: 'tags', mandatory: true },
    { name: 'start_year', mandatory: false },
    { name: 'end_year', mandatory: false },
    { name: 'default_included', mandatory: false },
  ],
  'events.csv': [
    { name: 'championship_name', mandatory: true },
    { name: 'track_id', mandatory: true },
    { name: 'name', mandatory: true },
    { name: 'month', mandatory: true },
    { name: 'week_end', mandatory: true },
    { name: 'mandatory', mandatory: true },
    { name: 'type', mandatory: true },
    { name: 'duration', mandatory: true },
    { name: 'start_time', mandatory: false },
  ],
  'teams.csv': [
    { name: 'name', mandatory: true },
    { name: 'principal', mandatory: true },
    { name: 'driver_loyalty', mandatory: false },
    { name: 'expectation_level', mandatory: false },
    { name: 'performance_rating', mandatory: false },
    { name: 'engineering_weight', mandatory: false },
    { name: 'engineering_drag', mandatory: false },
    { name: 'engineering_power', mandatory: false },
  ],
};

@Injectable({ providedIn: 'root' })
export class CsvParser {
  parseCars(text: string): Car[] {
    this.validateMandatoryHeaders('cars.csv', text);
    const rows = parse<CsvCar, Record<string, string>>(text, {
      bom: true,
      columns: (headers) => this.getHeadersFromCsv('cars.csv', headers),
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          championship_names: record['championship_names']
            .split(',')
            .map((s) => s.trim())
            .filter((name) => name.length > 0),
          livery_id: this.parseNumber(record['livery_id']),
        }) as CsvCar,
    });

    return rows.flatMap(({ championship_names, ...car }) =>
      championship_names.map((championship_name) => ({
        ...car,
        championship_name,
      })),
    );
  }

  parseChampionships(text: string): Championship[] {
    this.validateMandatoryHeaders('championships.csv', text);
    return parse<Championship, Record<string, string>>(text, {
      bom: true,
      columns: (headers) => this.getHeadersFromCsv('championships.csv', headers),
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          categories: record['categories'].split(',').map((s) => s.trim()),
          tags: record['tags'].split(',').map((s) => s.trim()),
          prestige: this.parseNumber(record['prestige']),
          init_month: this.parseNumber(record['init_month']),
          init_day: this.parseNumber(record['init_day']),
          registration_start_month: this.parseNumber(record['registration_start_month']),
          registration_start_day: this.parseNumber(record['registration_start_day']),
          registration_end_month: this.parseNumber(record['registration_end_month']),
          registration_end_day: this.parseNumber(record['registration_end_day']),
          events_count: this.parseNumber(record['events_count']),
          start_year: this.parseNumber(record['start_year']),
          end_year: this.parseNumber(record['end_year']),
          points: record['points'].split(',').map((s) => Number(s.trim())),
          pit_stop: this.parseBoolean(record['pit_stop']),
          default_included: this.parseBoolean(record['default_included']),
          parc_ferme: this.parseBoolean(record['parc_ferme']),
          field_type: this.parseString(record['field_type']),
        }) as Championship,
    });
  }

  parseEvents(text: string): RaceEvent[] {
    this.validateMandatoryHeaders('events.csv', text);
    return parse<RaceEvent, Record<string, string>>(text, {
      bom: true,
      columns: (headers) => this.getHeadersFromCsv('events.csv', headers),
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          month: this.parseNumber(record['month']),
          week_end: this.parseNumber(record['week_end']),
          duration: this.parseNumber(record['duration']),
          mandatory: this.parseBoolean(record['mandatory']),
          start_time: this.parseString(record['start_time']),
        }) as RaceEvent,
    });
  }

  parseTeams(text: string): Team[] {
    this.validateMandatoryHeaders('teams.csv', text);
    return parse<Team, Record<string, string>>(text, {
      bom: true,
      columns: (headers) => this.getHeadersFromCsv('teams.csv', headers),
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          driver_loyalty: this.parseNumber(record['driver_loyalty']),
          expectation_level: this.parseNumber(record['expectation_level']),
          performance_rating: this.parseNumber(record['performance_rating']),
          engineering_weight: this.parseNumber(record['engineering_weight']),
          engineering_drag: this.parseNumber(record['engineering_drag']),
          engineering_power: this.parseNumber(record['engineering_power']),
        }) as Team,
    });
  }

  parseTracks(text: string): Track[] {
    return parse<Track, Record<string, string>>(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          grade: this.parseNumber(record['grade']),
          garages: this.parseNumber(record['garages']),
          length: this.parseNumber(record['length']),
          turns: this.parseNumber(record['turns']),
          start_year: this.parseNumber(record['start_year']),
          end_year: this.parseNumber(record['end_year']),
          is_mod: this.parseBoolean(record['is_mod']),
        }) as Track,
    });
  }

  parseModels(text: string): VehicleModel[] {
    return parse<VehicleModel, Record<string, string>>(text, {
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
      on_record: (record) =>
        ({
          ...record,
          year: this.parseNumber(record['year']),
        }) as VehicleModel,
    });
  }

  parseLiveries(text: string): Livery[] {
    return parse<Livery, Record<string, string>>(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          livery_id: this.parseNumber(record['livery_id']),
          is_mod: this.parseBoolean(record['is_mod']),
        }) as Livery,
    });
  }

  parseClasses(text: string): VehicleClass[] {
    return parse<VehicleClass, Record<string, string>>(text, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      on_record: (record) =>
        ({
          ...record,
          name: this.parseString(record['name']),
          is_mod: this.parseBoolean(record['is_mod']),
        }) as VehicleClass,
    });
  }

  private validateMandatoryHeaders(fileName: CsvFile, text: string): void {
    const mandatoryHeaders = EXPECTED_HEADERS[fileName]
      .filter((h) => h.mandatory)
      .map((h) => h.name);
    if (!mandatoryHeaders) return;

    const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0];
    if (!firstLine) {
      throw new CsvValidationError(fileName, `File "${fileName}" is empty`);
    }

    const actual = firstLine.split(',').map((h) => h.trim());
    const missing = mandatoryHeaders.filter((h) => !actual.includes(h));

    if (missing.length > 0) {
      throw new CsvValidationError(
        fileName,
        `Missing columns in "${fileName}": ${missing.join(', ')}`,
      );
    }
  }

  private getHeadersFromCsv(csvName: CsvFile, parsedHeaders: string[]): (string | undefined)[] {
    const expectedHeaders = EXPECTED_HEADERS[csvName].map((h) => h.name);
    return parsedHeaders.map((h) => (expectedHeaders.includes(h) ? h : undefined));
  }

  private parseNumber(value: string): number | null {
    if (value === undefined || value === '') return null;
    return Number(value);
  }

  private parseBoolean(value: string): boolean {
    return value?.toLowerCase() === 'true';
  }

  private parseString(value: string): string | null {
    if (value === undefined || value.trim() === '') return null;
    return value.trim();
  }
}
