import { ChampionshipRepository } from '@/db/championship-repository';
import { Championship } from '@/shared/models/championship';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

export const championshipResolver: ResolveFn<Championship | RedirectCommand> = async (route) => {
  const championshipRepository = inject(ChampionshipRepository);
  const router = inject(Router);
  const championshipId = route.paramMap.get('id')!;
  const championship = await championshipRepository.getChampionshipById(Number(championshipId));
  if (!championship) {
    return new RedirectCommand(router.parseUrl('/championships'));
  }
  return championship;
};
