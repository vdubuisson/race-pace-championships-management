import { TeamRepository } from '@/db/team-repository';
import { Team } from '@/shared/models/team';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

export const teamResolver: ResolveFn<Team | RedirectCommand> = async (route) => {
  const teamRepository = inject(TeamRepository);
  const router = inject(Router);
  const teamId = route.paramMap.get('id')!;
  const team = await teamRepository.getTeamById(Number(teamId));
  if (!team) {
    return new RedirectCommand(router.parseUrl('/teams'));
  }
  return team;
};
