import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn } from '@angular/router';
import { CarRepository } from '@/db/car-repository';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { EMPTY_TEAM_NAME } from '@/shared/constants/special-values';

export const championshipCarsResolver: ResolveFn<Car[] | RedirectCommand> = async (route) => {
  const carRepository = inject(CarRepository);
  const championshipName = (route.data['championship'] as Championship).name;
  const cars = await carRepository.getCarsByChampionshipName(championshipName);
  return cars.filter(car => route.data['invitational'] ? car.team_name === EMPTY_TEAM_NAME : car.team_name !== EMPTY_TEAM_NAME);
};
