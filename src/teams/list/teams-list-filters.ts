import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { TeamRepository } from '@/db/team-repository';
import { computed, inject, linkedSignal, resource, Service } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { TeamStatsMapper, TeamWithStats } from '../team-stats-mapper/team-stats-mapper';

@Service({ autoProvided: false })
export class TeamsListFilters {
  private readonly teamRepository = inject(TeamRepository);
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly teamStatsMapper = inject(TeamStatsMapper);

  private readonly cars = resource({
    loader: () => this.carRepository.getAllCars(),
    defaultValue: [],
  });
  private readonly championships = toSignal(this.championshipRepository.getAllChampionships(), {
    initialValue: [],
  });
  private readonly teams = toSignal(this.teamRepository.getAllTeams(), { initialValue: [] });

  protected readonly teamsWithStats = computed(() =>
    this.teams().map((team) =>
      this.teamStatsMapper.getTeamWithStats(team, this.cars.value(), this.championships()),
    ),
  );

  readonly tagsOptions = computed(() => {
    const tagsSet = new Set<string>();
    this.teamsWithStats()
      .flatMap((team) => Array.from(team.tags))
      .filter((tag) => tag?.length)
      .forEach((tag) => tagsSet.add(tag));
    return Array.from(tagsSet).toSorted();
  });

  readonly startYearOptions = computed(() => {
    const yearsSet = new Set<number>();
    this.teamsWithStats()
      .map((team) => team.startYear)
      .filter((year) => year !== null)
      .forEach((year) => yearsSet.add(year));
    return Array.from(yearsSet).toSorted();
  });

  readonly endYearOptions = computed(() => {
    const yearsSet = new Set<number>();
    this.teamsWithStats()
      .map((team) => team.endYear)
      .filter((year) => year !== null)
      .forEach((year) => yearsSet.add(year));
    return Array.from(yearsSet).toSorted();
  });

  readonly form = new FormGroup({
    name: new FormControl(''),
    tag: new FormControl(''),
    championshipsCount: new FormControl<number | null>(null),
    carsCount: new FormControl<number | null>(null),
    startYear: new FormControl<number | null>(null),
    endYear: new FormControl<number | null>(null),
  });

  readonly filteredTeams = linkedSignal(() => this.applyFilters(this.teamsWithStats()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const filtered = this.applyFilters(this.teamsWithStats());
      this.filteredTeams.set(filtered);
    });
  }

  private applyFilters(teams: TeamWithStats[]): TeamWithStats[] {
    let filtered = [...teams];

    const nameFilter = this.form.controls.name.value || '';
    const tagFilter = this.form.controls.tag.value || '';
    const championshipsCountFilter = this.form.controls.championshipsCount.value;
    const carsCountFilter = this.form.controls.carsCount.value;
    const startYearFilter = this.form.controls.startYear.value;
    const endYearFilter = this.form.controls.endYear.value;

    if (nameFilter?.length > 0) {
      filtered = filtered.filter((team) =>
        team.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }
    if (tagFilter?.length > 0) {
      filtered = filtered.filter((team) => team.tags.has(tagFilter));
    }
    if (championshipsCountFilter !== null) {
      filtered = filtered.filter((team) => team.championshipsCount === championshipsCountFilter);
    }
    if (carsCountFilter !== null) {
      filtered = filtered.filter((team) => team.carsCount === carsCountFilter);
    }
    if (startYearFilter !== null) {
      filtered = filtered.filter((team) => team.startYear === startYearFilter);
    }
    if (endYearFilter !== null) {
      filtered = filtered.filter((team) => team.endYear === endYearFilter);
    }

    return filtered;
  }
}
