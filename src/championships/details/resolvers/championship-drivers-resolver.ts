import { DriverRepository } from '@/db/driver-repository';
import { Championship } from '@/shared/models/championship';
import { Driver } from '@/shared/models/driver';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn } from '@angular/router';

export const championshipDriversResolver: ResolveFn<Driver[] | RedirectCommand> = (route) => {
  const driverRepository = inject(DriverRepository);
  const championshipName = (route.data['championship'] as Championship).name;
  return driverRepository.getDriversByChampionshipName(championshipName);
};
