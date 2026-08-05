import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { DriverRepository } from '@/db/driver-repository';
import { EventRepository } from '@/db/event-repository';
import { ModelRepository } from '@/db/model-repository';
import { TeamRepository } from '@/db/team-repository';
import { TrackRepository } from '@/db/track-repository';
import { Car, CsvCar } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Driver } from '@/shared/models/driver';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { inject, Service } from '@angular/core';
import JSZip from '@progress/jszip-esm';
import { stringify } from 'csv-stringify/browser/esm/sync';
import { RelationChecker } from './relation-checker';

@Service()
export default class CsvExporter {
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly eventRepository = inject(EventRepository);
  private readonly teamRepository = inject(TeamRepository);
  private readonly trackRepository = inject(TrackRepository);
  private readonly modelRepository = inject(ModelRepository);
  private readonly driverRepository = inject(DriverRepository);

  private readonly relationChecker = inject(RelationChecker);

  async downloadCsvsZip({
    withDrivers,
    withTrackMods,
    filename,
    championshipIds,
  }: {
    withDrivers: boolean;
    withTrackMods: boolean;
    filename: string;
    championshipIds: number[];
  }): Promise<void> {
    const championships =
      await this.championshipRepository.getAllChampionshipsByIds(championshipIds);
    const championshipNames = championships.map((championship) => championship.name);
    const cars = await this.carRepository.getCarsByChampionshipNames(championshipNames);
    const events = await this.eventRepository.getEventsByChampionshipNames(championshipNames);

    const teamNames = new Set(cars.map((car) => car.team_name));
    const teams = await this.teamRepository.getTeamsByNames(Array.from(teamNames));

    let tracks = await this.trackRepository.getAllTracks();
    if (!withTrackMods) {
      tracks = tracks.filter((track) => !track.is_mod);
    }

    const drivers = withDrivers
      ? await this.driverRepository.getDriversByChampionshipNames(championshipNames)
      : [];

    const relationErrors = this.relationChecker.getRelationErrors(
      cars,
      championships,
      drivers,
      events,
      teams,
      tracks,
    );
    if (relationErrors.length > 0) {
      throw new Error(relationErrors.join('<br/>'));
    }

    const [carsCsv, championshipsCsv, eventsCsv, teamsCsv, tracksCsv, driversCsv] =
      await Promise.all([
        this.createCarsCsv(cars),
        this.createChampionshipsCsv(championships),
        this.createEventsCsv(events),
        this.createTeamsCsv(teams),
        this.createTracksCsv(tracks),
        this.createDriversCsv(drivers),
      ]);

    await this.createZipAndDownload({
      carsCsv,
      championshipsCsv,
      eventsCsv,
      teamsCsv,
      tracksCsv,
      driversCsv,
      filename,
    });
  }

  private async createCarsCsv(cars: Car[]): Promise<string> {
    const models = await this.modelRepository.getAllModels();
    const groupedCars = new Map<string, CsvCar>();

    for (const car of cars) {
      const modelFolder =
        models.find((model) => model.class === car.category && model.name === car.model)
          ?.folder_name ?? '';
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

    const records = Array.from(groupedCars.values())
      .map((groupedCar) => ({
        ...groupedCar,
        championship_names: groupedCar.championship_names.join(','),
      }))
      .toSorted(
        (a, b) =>
          a.team_name.localeCompare(b.team_name) ||
          a.category.localeCompare(b.category) ||
          a.model.localeCompare(b.model) ||
          a.livery.localeCompare(b.livery),
      );

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

  private async createChampionshipsCsv(championships: Championship[]): Promise<string> {
    const records = championships
      .map((championship) => ({
        ...championship,
        categories: championship.categories.join(','),
        points: championship.points.join(','),
        pit_stop: this.toCsvBoolean(championship.pit_stop),
        field_type: championship.field_type ?? '',
        tags: championship.tags.join(','),
        start_year: championship.start_year ?? '',
        end_year: championship.end_year ?? '',
        default_included: this.toCsvBoolean(championship.default_included),
        parc_ferme: this.toCsvBoolean(championship.parc_ferme),
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));

    return stringify(records, {
      header: true,
      columns: [
        'name',
        'categories',
        'prestige',
        'points',
        'pit_stop',
        'start_type',
        'field_type',
        'parc_ferme',
        'events_count',
        'tags',
        'init_month',
        'init_day',
        'registration_start_month',
        'registration_start_day',
        'registration_end_month',
        'registration_end_day',
        'start_year',
        'end_year',
        'default_included',
      ],
      quoted_match: /,/,
    });
  }

  private async createEventsCsv(events: RaceEvent[]): Promise<string> {
    const records = events
      .map((event) => ({
        ...event,
        mandatory: this.toCsvBoolean(event.mandatory),
        start_time: event.start_time ?? '',
      }))
      .toSorted(
        (a, b) =>
          a.championship_name.localeCompare(b.championship_name) ||
          a.month - b.month ||
          a.week_end - b.week_end,
      );

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

  private async createTeamsCsv(teams: Team[]): Promise<string> {
    const records = teams
      .map((team) => ({
        ...team,
        driver_loyalty: team.driver_loyalty ?? '',
        expectation_level: team.expectation_level ?? '',
        performance_rating: team.performance_rating ?? '',
        engineering_weight: team.engineering_weight ?? '',
        engineering_drag: team.engineering_drag ?? '',
        engineering_power: team.engineering_power ?? '',
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));

    return stringify(records, {
      header: true,
      columns: [
        'name',
        'principal',
        'driver_loyalty',
        'expectation_level',
        'performance_rating',
        'engineering_weight',
        'engineering_drag',
        'engineering_power',
      ],
    });
  }

  private async createDriversCsv(drivers: Driver[]): Promise<string> {
    const records = drivers.toSorted(
      (a, b) =>
        a.championship_name.localeCompare(b.championship_name) ||
        a.team_name.localeCompare(b.team_name) ||
        a.surname.localeCompare(b.surname) ||
        a.name.localeCompare(b.name),
    );

    return stringify(records, {
      header: true,
      columns: [
        'name',
        'surname',
        'championship_name',
        'category',
        'team_name',
        'end_year',
        'expected_standing',
        'team_loyalty',
        'country',
        'dob',
        'elo',
        'race_skill',
        'qualifying_skill',
        'aggression',
        'defending',
        'stamina',
        'consistency',
        'start_reactions',
        'wet_skill',
        'tyre_management',
        'fuel_management',
        'blue_flag_conceding',
        'weather_tyre_changes',
        'avoidance_of_mistakes',
        'avoidance_of_forced_mistakes',
        'setup_downforce',
        'setup_downforce_randomness',
      ],
    });
  }

  private async createTracksCsv(tracks: Track[]): Promise<string> {
    const records = tracks
      .map((track) => ({
        ...track,
        end_year: track.end_year ?? '',
        is_mod: this.toCsvBoolean(track.is_mod),
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));

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

  private async createZipAndDownload({
    carsCsv,
    championshipsCsv,
    eventsCsv,
    teamsCsv,
    tracksCsv,
    driversCsv,
    filename,
  }: {
    carsCsv: string;
    championshipsCsv: string;
    eventsCsv: string;
    teamsCsv: string;
    tracksCsv: string;
    driversCsv: string;
    filename: string;
  }): Promise<void> {
    const zip = new JSZip();
    zip.file('cars.csv', carsCsv);
    zip.file('championships.csv', championshipsCsv);
    zip.file('events.csv', eventsCsv);
    zip.file('teams.csv', teamsCsv);
    zip.file('tracks.csv', tracksCsv);
    zip.file('drivers.csv', driversCsv);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    this.downloadBlob(blob, `${filename}.zip`);
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
