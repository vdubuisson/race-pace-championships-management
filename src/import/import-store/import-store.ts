import { ChampionshipRepository } from '@/db/championship-repository';
import { TeamRepository } from '@/db/team-repository';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Driver } from '@/shared/models/driver';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { computed, inject, resource, Service, signal } from '@angular/core';
import { DbLoader } from '../db-loader/db-loader';

@Service()
export class ImportStore {
  private readonly dbLoader = inject(DbLoader);
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly teamRepository = inject(TeamRepository);

  readonly championships = signal<Championship[]>([]);
  readonly cars = signal<Car[]>([]);
  readonly drivers = signal<Driver[]>([]);
  readonly events = signal<RaceEvent[]>([]);
  readonly teams = signal<Team[]>([]);

  readonly selectedChampionshipIds = signal<number[]>([]);
  readonly selectedTeamIds = signal<number[]>([]);
  readonly selectedDriverIds = signal<number[]>([]);

  private readonly selectedChampionships = computed(() =>
    this.championships().filter((championship) =>
      this.selectedChampionshipIds().includes(championship.id!),
    ),
  );
  private readonly selectedCars = computed(() =>
    this.cars().filter((car) =>
      this.selectedChampionships().some(
        (championship) => championship.name === car.championship_name,
      ),
    ),
  );
  private readonly selectedEvents = computed(() =>
    this.events().filter((event) =>
      this.selectedChampionships().some(
        (championship) => championship.name === event.championship_name,
      ),
    ),
  );
  readonly preSelectedTeamNames = computed(
    () => new Set(this.selectedCars().map((car) => car.team_name)),
  );
  private readonly selectedTeams = computed(() =>
    this.teams().filter((team) => this.selectedTeamIds().includes(team.id!)),
  );
  private readonly selectedDrivers = computed(() =>
    this.drivers().filter((driver) => this.selectedDriverIds().includes(driver.id!)),
  );

  readonly conflictingChampionships = resource({
    params: () => ({
      names: this.championships().map((championship) => championship.name),
    }),
    loader: ({ params: { names } }) =>
      names.length > 0
        ? this.championshipRepository.getAllChampionshipsByNames(names)
        : Promise.resolve([]),
    defaultValue: [],
  });

  readonly conflictingTeams = resource({
    params: () => ({ names: this.teams().map((team) => team.name) }),
    loader: ({ params: { names } }) =>
      names.length > 0 ? this.teamRepository.getTeamsByNames(names) : Promise.resolve([]),
    defaultValue: [],
  });

  storeChampionships({
    cars,
    championships,
    drivers,
    events,
    teams,
  }: {
    cars: Car[];
    championships: Championship[];
    drivers: Driver[];
    events: RaceEvent[];
    teams: Team[];
  }): void {
    this.championships.set(
      championships.map((championship, index) => ({ ...championship, id: index })),
    );
    this.cars.set(cars.map((car, index) => ({ ...car, id: index })));
    this.events.set(events.map((event, index) => ({ ...event, id: index })));
    this.drivers.set(drivers.map((driver, index) => ({ ...driver, id: index })));
    this.teams.set(teams.map((team, index) => ({ ...team, id: index })));
  }

  loadIntoDb(isOverwrite: boolean): Promise<void> {
    return this.dbLoader.loadChampionshipsIntoDb(
      {
        championships: this.selectedChampionships().map((championship) => ({
          ...championship,
          id: undefined,
        })),
        cars: this.selectedCars().map((car) => ({ ...car, id: undefined })),
        events: this.selectedEvents().map((event) => ({ ...event, id: undefined })),
        teams: this.selectedTeams().map((team) => ({ ...team, id: undefined })),
        drivers: this.selectedDrivers().map((driver) => ({ ...driver, id: undefined })),
      },
      isOverwrite,
    );
  }
}
