import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { Team } from '@/shared/models/team';
import { TeamStatsMapper } from '@/teams/team-stats-mapper/team-stats-mapper';
import { PercentPipe } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { TuiArcChart, TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiCell, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiAvatar, TuiChip, TuiTooltip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCardMedium, TuiHeader, TuiItemGroup } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-global-tab',
  templateUrl: './team-global-tab.html',
  styleUrl: './team-global-tab.css',
  imports: [
    PercentPipe,
    TuiArcChart,
    TuiAutoColorPipe,
    TuiAvatar,
    TuiCardLarge,
    TuiCardMedium,
    TuiCell,
    TuiChip,
    TuiHeader,
    TuiHovered,
    TuiIcon,
    TuiItemGroup,
    TuiLegendItem,
    TuiRingChart,
    TuiTitle,
    TuiTooltip,
  ],
})
export default class TeamGlobalTab {
  private readonly carRepository = inject(CarRepository);
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly teamStatsMapper = inject(TeamStatsMapper);

  readonly team = input.required<Team>();

  private readonly teamCars = resource({
    params: () => this.team().name,
    loader: ({ params: teamName }) => this.carRepository.getCarsByTeamName(teamName),
    defaultValue: [],
  });

  private readonly teamChampionships = resource({
    params: ({ chain }) => [...new Set(chain(this.teamCars).map((car) => car.championship_name))],
    loader: ({ params: names }) => this.championshipRepository.getAllChampionshipsByNames(names),
    defaultValue: [],
  });

  protected readonly teamWithStats = computed(() =>
    this.teamStatsMapper.getTeamWithStats(
      this.team(),
      this.teamCars.value(),
      this.teamChampionships.value(),
    ),
  );

  protected activeEngineeringIndex = signal(NaN);
  protected readonly engineeringRawValues = computed(() => [
    this.team().engineering_weight,
    this.team().engineering_drag,
    this.team().engineering_power,
  ]);
  protected readonly engineeringValues = computed(() =>
    this.engineeringRawValues().map((value) => value ?? 0),
  );
  protected readonly engineeringLabels = computed(() => ['Weight', 'Drag', 'Power']);

  protected readonly loyaltyTooltip = `How much a team will favour drivers they are happy with VS better ranked drivers that are on the market.`;
  protected readonly expectationLevelTooltip = `Happiness of driver/team relationships is determined by how well a driver does compared to what can be theoretically expected of them based on their past results.`;
  protected readonly performanceRatingTooltip = `How much budget the team has for performance and what the expected results from their sponsors.`;
  protected readonly engineeringTooltip = `Balance in which the performance budget is allocated.`;

  protected onEngineeringHover(index: number, hovered: boolean): void {
    this.activeEngineeringIndex.set(hovered ? index : Number.NaN);
  }
}
