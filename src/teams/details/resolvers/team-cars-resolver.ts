import { CarRepository } from '@/db/car-repository';
import { Car } from '@/shared/models/car';
import { Team } from '@/shared/models/team';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn } from '@angular/router';

export const teamCarsResolver: ResolveFn<Car[] | RedirectCommand> = (route) => {
  const carRepository = inject(CarRepository);
  const teamName = (route.data['team'] as Team).name;
  return carRepository.getCarsByTeamName(teamName);
};
