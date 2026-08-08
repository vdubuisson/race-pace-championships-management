import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Driver } from '@/shared/models/driver';
import { RaceEvent } from '@/shared/models/race-event';
import { Team } from '@/shared/models/team';
import { Track } from '@/shared/models/track';
import { Service } from '@angular/core';

@Service()
export class RelationChecker {
  getRelationErrors(
    cars: Car[],
    championships: Championship[],
    drivers: Driver[],
    events: RaceEvent[],
    teams: Team[],
    tracks: Track[],
  ): string[] {
    const errors: string[] = [];

    errors.push(...this.checkEventsRelations(events, tracks));

    errors.push(...this.checkCarsRelations(cars, teams));

    errors.push(...this.checkDriversRelations(drivers, teams, championships, cars));

    return errors;
  }

  private checkEventsRelations(events: RaceEvent[], tracks: Track[]): string[] {
    const errors: string[] = [];
    for (let event of events) {
      if (!tracks.some((track) => track.id === event.track_id)) {
        errors.push(`Event "${event.name}" in "${event.championship_name}" use an invalid track.`);
      }
    }
    return errors;
  }

  private checkCarsRelations(cars: Car[], teams: Team[]): string[] {
    const errors: string[] = [];
    for (let car of cars) {
      if (!teams.some((team) => team.name === car.team_name)) {
        errors.push(
          `Car "${car.livery}" in "${car.championship_name}" is affected to a non-existing team.`,
        );
      }
      if (
        cars.some(
          (otherCar) =>
            otherCar.id !== car.id &&
            otherCar.model === car.model &&
            otherCar.livery === car.livery &&
            otherCar.championship_name === car.championship_name,
        )
      ) {
        errors.push(
          `Car "${car.livery}" in "${car.championship_name}" has a duplicate model/livery combination.`,
        );
      }
    }
    return errors;
  }

  private checkDriversRelations(
    drivers: Driver[],
    teams: Team[],
    championships: Championship[],
    cars: Car[],
  ): string[] {
    const errors: string[] = [];
    const seats: Map<string, number> = new Map();
    for (let driver of drivers) {
      if (!teams.some((team) => team.name === driver.team_name)) {
        errors.push(
          `Driver "${driver.name} ${driver.surname}" is affected to a non-existing team.`,
        );
      }
      const affectedChampionship = championships.find(
        (championship) => championship.name === driver.championship_name,
      );
      if (affectedChampionship === undefined) {
        errors.push(
          `Driver "${driver.name} ${driver.surname}" is affected to a non-existing championship.`,
        );
        continue;
      }
      const affectedCategory = affectedChampionship.categories.find(
        (category) => category === driver.category,
      );
      if (affectedCategory === undefined) {
        errors.push(
          `Driver "${driver.name} ${driver.surname}" is affected to a non-existing category of its championship.`,
        );
        continue;
      }
      if (
        !cars.some(
          (car) =>
            car.championship_name === affectedChampionship.name &&
            car.category === affectedCategory &&
            car.team_name === driver.team_name,
        )
      ) {
        errors.push(
          `Driver "${driver.name} ${driver.surname}" has no matching car in for its championship/category/team.`,
        );
        continue;
      }
      const seatKey = `${affectedChampionship.name}___${affectedCategory}___${driver.team_name}`;
      const currentSeatCount = seats.get(seatKey) ?? 0;
      seats.set(seatKey, currentSeatCount + 1);
    }

    seats.forEach((seatCount, seatKey) => {
      const [championshipName, category, teamName] = seatKey.split('___');
      const carsCount = cars.filter(
        (car) =>
          car.championship_name === championshipName &&
          car.category === category &&
          car.team_name === teamName,
      ).length;
      if (seatCount > carsCount) {
        errors.push(
          `Too many drivers affected to "${teamName}" in "${championshipName} / ${category}".`,
        );
      }
    });

    return errors;
  }
}
