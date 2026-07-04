import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { Team } from '@/shared/models/team';
import { Service } from '@angular/core';

export type TeamWithStats = Team & {
  championshipsCount: number;
  carsCount: number;
  tags: Set<string>;
  startYear: number | null;
  endYear: number | null;
};

@Service()
export class TeamStatsMapper {
  getTeamWithStats(team: Team, cars: Car[], championships: Championship[]): TeamWithStats {
    const teamCars = cars.filter((car) => car.team_name === team.name);
    const teamChampionshipsSet = new Set(
      teamCars
        .map((car) =>
          championships.filter((championship) => championship.name === car.championship_name),
        )
        .flat(),
    );
    const teamChampionships = Array.from(teamChampionshipsSet);

    if (teamChampionships.length === 0 || teamCars.length === 0) {
      return {
        ...team,
        championshipsCount: 0,
        carsCount: 0,
        tags: new Set<string>(),
        startYear: null,
        endYear: null,
      };
    }

    const tagsArray = teamChampionships
      .map((championship) => championship.tags)
      .flat()
      .toSorted();
    const tagsSet = new Set(tagsArray);

    const startYear = teamChampionships.every((championship) => championship.start_year === null)
      ? null
      : Math.min(
          ...teamChampionships
            .map((championship) => championship.start_year)
            .filter((year) => year !== null),
        );
    const endYear = teamChampionships.some((championship) => championship.end_year === null)
      ? null
      : Math.max(...teamChampionships.map((championship) => championship.end_year!));

    return {
      ...team,
      championshipsCount: teamChampionships.length,
      carsCount: teamCars.length,
      tags: tagsSet,
      startYear: startYear,
      endYear: endYear,
    };
  }
}
