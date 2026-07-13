import { DriverRepository } from '@/db/driver-repository';
import { Driver } from '@/shared/models/driver';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

export const driverResolver: ResolveFn<Driver | RedirectCommand> = async (route) => {
  const driverRepository = inject(DriverRepository);
  const router = inject(Router);
  const driverId = route.paramMap.get('id')!;
  const driver = await driverRepository.getDriverById(Number(driverId));
  if (!driver) {
    return new RedirectCommand(router.parseUrl('/drivers'));
  }
  return driver;
};
