import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { EventRepository } from '@/db/event-repository';
import { ModelRepository } from '@/db/model-repository';
import { TeamRepository } from '@/db/team-repository';
import { TrackRepository } from '@/db/track-repository';
import { CsvCar } from '@/shared/models/car';
import { inject, Injectable } from '@angular/core';
import JSZip from '@progress/jszip-esm';
import { stringify } from 'csv-stringify/browser/esm/sync';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CsvExporter {
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly eventRepository = inject(EventRepository);
  private readonly teamRepository = inject(TeamRepository);
  private readonly trackRepository = inject(TrackRepository);
  private readonly modelRepository = inject(ModelRepository);

  async downloadCsvsZip(zipName = 'race_pace_custom_championships.zip'): Promise<void> {
    const [carsCsv, championshipsCsv, eventsCsv, teamsCsv, tracksCsv] = await Promise.all([
      this.createCarsCsv(),
      this.createChampionshipsCsv(),
      this.createEventsCsv(),
      this.createTeamsCsv(),
      this.createTracksCsv(),
    ]);

    const zip = new JSZip();
    zip.file('cars.csv', carsCsv);
    zip.file('championships.csv', championshipsCsv);
    zip.file('events.csv', eventsCsv);
    zip.file('teams.csv', teamsCsv);
    zip.file('tracks.csv', tracksCsv);

    const blob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(blob, zipName);
  }

  private async createCarsCsv(): Promise<string> {
    const [cars, models] = await Promise.all([
      this.carRepository.getAllCars(),
      this.modelRepository.getAllModels(),
    ]);
    const modelFolderByName = new Map(models.map((model) => [model.name, model.folder_name]));

    const groupedCars = new Map<string, CsvCar>();

    for (const car of cars) {
      const modelFolder =
        modelFolderByName.get(car.livery) ?? modelFolderByName.get(car.model) ?? car.model_folder;
      const key = `${car.team_name}::${car.category}::${car.model}::${car.livery}::${car.livery_id}::${modelFolder}`;
      const existingGroupedCar = groupedCars.get(key);

      if (existingGroupedCar) {
        const championshipNames = new Set(existingGroupedCar.championship_names);
        championshipNames.add(car.championship_name);
        existingGroupedCar.championship_names = Array.from(championshipNames);
        continue;
      }

      groupedCars.set(key, {
        team_name: car.team_name,
        category: car.category,
        model: car.model,
        livery: car.livery,
        championship_names: [car.championship_name],
        livery_id: car.livery_id,
        model_folder: modelFolder,
      });
    }

    const records = Array.from(groupedCars.values()).map((groupedCar) => ({
      ...groupedCar,
      championship_names: groupedCar.championship_names.join(', '),
    }));

    return stringify(records, {
      header: true,
      columns: [
        'team_name',
        'category',
        'model',
        'livery',
        'championship_names',
        'livery_id',
        'model_folder',
      ],
      quoted_match: /,/,
    });
  }

  private async createChampionshipsCsv(): Promise<string> {
    const championships = await firstValueFrom(this.championshipRepository.getAllChampionships());
    const records = championships.map((championship) => ({
      ...championship,
      categories: championship.categories.join(', '),
      points: championship.points.join(', '),
      pit_stop: this.toCsvBoolean(championship.pit_stop),
      field_type: championship.field_type ?? '',
      tags: championship.tags.join(', '),
      start_year: championship.start_year ?? '',
      end_year: championship.end_year ?? '',
      default_included: this.toCsvBoolean(championship.default_included),
    }));

    return stringify(records, {
      header: true,
      columns: [
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
      quoted_match: /,/,
    });
  }

  private async createEventsCsv(): Promise<string> {
    const events = await this.eventRepository.getAllEvents();

    const records = events.map((event) => ({
      ...event,
      mandatory: this.toCsvBoolean(event.mandatory),
      start_time: event.start_time ?? '',
    }));

    return stringify(records, {
      header: true,
      columns: [
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
    });
  }

  private async createTeamsCsv(): Promise<string> {
    const teams = await this.teamRepository.getAllTeams();

    const records = teams.map((team) => ({
      ...team,
      driver_loyalty: team.driver_loyalty ?? '',
      expectation_level: team.expectation_level ?? '',
    }));

    return stringify(records, {
      header: true,
      columns: ['name', 'elo', 'principal', 'driver_loyalty', 'expectation_level'],
    });
  }

  private async createTracksCsv(): Promise<string> {
    const tracks = await this.trackRepository.getAllTracks();

    const records = tracks.map((track) => ({
      ...track,
      end_year: track.end_year ?? '',
      is_mod: this.toCsvBoolean(track.is_mod),
    }));

    return stringify(records, {
      header: true,
      columns: [
        'id',
        'name',
        'type',
        'grade',
        'garages',
        'country',
        'length',
        'turns',
        'start_year',
        'end_year',
        'real_name',
        'is_mod',
        'location',
      ],
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const anchor = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  private toCsvBoolean(value: boolean): 'TRUE' | 'FALSE' {
    return value ? 'TRUE' : 'FALSE';
  }
}
