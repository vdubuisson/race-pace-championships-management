import { ChampionshipsService } from '@/championships/championships-service/championships-service';
import { ChampionshipWithClasses } from '@/shared/models/championship';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

export const championshipResolver: ResolveFn<ChampionshipWithClasses | RedirectCommand> = async (
  route,
) => {
  const championshipsService = inject(ChampionshipsService);
  const router = inject(Router);
  const championshipId = route.paramMap.get('id')!;
  const championship = await championshipsService.getChampionship(Number(championshipId));
  if (!championship) {
    return new RedirectCommand(router.parseUrl('/championships'));
  }
  return championship;
};
