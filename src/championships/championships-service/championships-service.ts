import { AppDatabase } from '@/db/app-database';
import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { EventRepository } from '@/db/event-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { Car } from '@/shared/models/car';
import { Championship, ChampionshipWithClasses } from '@/shared/models/championship';
import { RaceEvent } from '@/shared/models/race-event';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

type SaveChampionshipPayload = {
  championship: Championship;
  events: Omit<RaceEvent, 'championship_name'>[];
  cars: Omit<Car, 'championship_name'>[];
  id?: number;
  previousName?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ChampionshipsService {
  private readonly appDatabase = inject(AppDatabase);
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly vehicleClassRepository = inject(VehicleClassRepository);
  private readonly eventRepository = inject(EventRepository);
  private readonly carRepository = inject(CarRepository);

  async getChampionship(id: number): Promise<ChampionshipWithClasses> {
    const championship = await this.championshipRepository.getChampionshipById(id);
    if (!championship) {
      throw new Error(`Championship with id ${id} not found`);
    }
    const classes = await this.vehicleClassRepository.getVehicleClassesByIds(
      championship.categories,
    );
    return { ...championship, classes };
  }

  getChampionships(): Observable<ChampionshipWithClasses[]> {
    return this.championshipRepository.getAllChampionships().pipe(
      switchMap(async (championships) => {
        const classes = await this.vehicleClassRepository.getAllVehicleClasses();
        const classesById = new Map(classes.map((c) => [c.id, c]));
        return championships.map((championship) => ({
          ...championship,
          classes: championship.categories
            .map((categoryId) => classesById.get(categoryId))
            .filter((c): c is NonNullable<typeof c> => !!c),
        }));
      }),
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
      async () => {
        const championship = await this.championshipRepository.getChampionshipById(id);
        if (!championship) {
          throw new Error(`Championship with id ${id} not found`);
        }

        await this.championshipRepository.deleteChampionship(id);
        await this.eventRepository.deleteEventsByChampionshipNames([championship.name]);
        await this.carRepository.deleteCarsByChampionshipNames([championship.name]);
      },
    );
  }
}
