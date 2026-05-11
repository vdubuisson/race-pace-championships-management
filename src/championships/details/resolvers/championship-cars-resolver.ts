import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn } from '@angular/router';
import { CarRepository } from '@/db/car-repository';
import { Car } from '@/resources/models/car';
import { Championship } from '@/resources/models/championship';

export const championshipCarsResolver: ResolveFn<Car[] | RedirectCommand> = (route) => {
  const carRepository = inject(CarRepository);
  const championshipName = (route.data['championship'] as Championship).name;
  return carRepository.getCarsByChampionshipName(championshipName);
};
