import { TeamRepository } from '@/db/team-repository';
import { Service, inject } from '@angular/core';

@Service({ autoProvided: false })
export class TeamNameValidator {
  private readonly teamRepository = inject(TeamRepository);

  async isAvailable(name: string, id?: number) {
    const existingTeam = await this.teamRepository.getTeamByName(name);

    if (!existingTeam) {
      return true;
    }

    if (id !== undefined && existingTeam.id === id) {
      return true;
    }

    return false;
  }
}
