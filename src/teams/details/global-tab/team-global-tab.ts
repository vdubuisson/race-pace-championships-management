import { Team } from '@/shared/models/team';
import { PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TuiArcChart, TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiCell, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiTooltip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-global-tab',
  templateUrl: './team-global-tab.html',
  styleUrl: './team-global-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PercentPipe,
    TuiArcChart,
    TuiAvatar,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiHovered,
    TuiIcon,
    TuiLegendItem,
    TuiRingChart,
    TuiTitle,
    TuiTooltip,
  ],
})
export default class TeamGlobalTab {
  readonly team = input.required<Team>();

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
