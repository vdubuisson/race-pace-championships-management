import { AppDatabase } from '@/db/app-database';
import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { DriverRepository } from '@/db/driver-repository';
import { EventRepository } from '@/db/event-repository';
import { DRAFT_TAG } from '@/shared/constants/tags';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { RaceEvent } from '@/shared/models/race-event';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';

type SaveChampionshipPayload = {
  championship: Championship;
  events: Omit<RaceEvent, 'championship_name'>[];
  cars: Omit<Car, 'championship_name'>[];
  id?: number;
  previousName?: string;
};

@Service()
export class ChampionshipsService {
  private readonly appDatabase = inject(AppDatabase);
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly eventRepository = inject(EventRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly driverRepository = inject(DriverRepository);

  getAllChampionships(): Observable<Championship[]> {
    return this.championshipRepository.getAllChampionships();
  }

  getExportableChampionships(): Observable<Championship[]> {
    return this.championshipRepository
      .getAllChampionships()
      .pipe(
        map((championships) =>
          championships.filter((championship) => !championship.tags.includes(DRAFT_TAG)),
        ),
      );
  }

  async saveChampionshipWithRelations({
    championship,
    events,
    cars,
    id,
    previousName,
  }: SaveChampionshipPayload): Promise<number> {
    let championshipId = id;

    await this.appDatabase.transaction(
      'rw',
      this.championshipRepository.store,
      this.eventRepository.store,
      this.carRepository.store,
      this.driverRepository.store,
      async () => {
        if (typeof championshipId === 'number') {
          await this.championshipRepository.updateChampionship(championshipId, championship);
        } else {
          championshipId = await this.championshipRepository.addChampionship(championship);
        }

        const namesToClear = new Set<string>([championship.name]);
        if (previousName) {
          namesToClear.add(previousName);
        }

        await this.eventRepository.deleteEventsByChampionshipNames(Array.from(namesToClear));
        await this.eventRepository.addEvents(
          events.map((event) => ({ ...event, championship_name: championship.name })),
        );

        await this.carRepository.deleteCarsByChampionshipNames(Array.from(namesToClear));
        await this.carRepository.addCars(
          cars.map((car) => ({ ...car, championship_name: championship.name })),
        );

        if (previousName && previousName !== championship.name) {
          await this.driverRepository.updateDriversChampionshipName(
            previousName,
            championship.name,
          );
        }
      },
    );

    if (typeof championshipId !== 'number') {
      throw new Error('Failed to persist championship');
    }

    return championshipId;
  }

  async deleteChampionship(id: number): Promise<void> {
    await this.appDatabase.transaction(
      'rw',
      this.championshipRepository.store,
      this.eventRepository.store,
      this.carRepository.store,
      this.driverRepository.store,
      async () => {
        const championship = await this.championshipRepository.getChampionshipById(id);
        if (!championship) {
          throw new Error(`Championship with id ${id} not found`);
        }

        await this.championshipRepository.deleteChampionship(id);
        await this.eventRepository.deleteEventsByChampionshipNames([championship.name]);
        await this.carRepository.deleteCarsByChampionshipNames([championship.name]);
        await this.driverRepository.deleteDriversByChampionshipName(championship.name);
      },
    );
  }

  async hasDrivers(name: string): Promise<boolean> {
    return (await this.driverRepository.getDriversByChampionshipName(name)).length > 0;
  }
}
