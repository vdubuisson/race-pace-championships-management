import { LiveryRepository } from '@/db/livery-repository';
import { Championship } from '@/shared/models/championship';
import { Livery } from '@/shared/models/livery';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const championshipLiveriesResolver: ResolveFn<Livery[]> = (route) => {
  const liveryRepository = inject(LiveryRepository);
  const championshipCategories = (route.data['championship'] as Championship).categories;
  return liveryRepository.getLiveriesByClasses(championshipCategories);
};
