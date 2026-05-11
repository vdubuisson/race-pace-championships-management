import { RedirectCommand, ResolveFn, Router } from "@angular/router";
import { Championship } from "../../../resources/models/championship";
import { inject } from "@angular/core";
import { ChampionshipRepository } from "../../../db/championship-repository";

export const championshipResolver: ResolveFn<Championship | RedirectCommand> = async (route) => {
  const championshipRepository = inject(ChampionshipRepository);
  const router = inject(Router);
  const championshipId = route.paramMap.get('id')!;
  const championship = await championshipRepository.getChampionshipById(Number(championshipId));
  if (!championship) {
    return new RedirectCommand(router.parseUrl('/championships'));
  }
  return championship;
}
