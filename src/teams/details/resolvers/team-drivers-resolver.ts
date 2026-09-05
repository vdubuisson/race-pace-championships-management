import { DriverRepository } from '@/db/driver-repository';
import { Driver } from '@/shared/models/driver';
import { Team } from '@/shared/models/team';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn } from '@angular/router';

export const teamDriversResolver: ResolveFn<Driver[] | RedirectCommand> = (route) => {
  const driverRepository = inject(DriverRepository);
  const teamName = (route.data['team'] as Team).name;
  return driverRepository.getDriversByTeamName(teamName);
};
