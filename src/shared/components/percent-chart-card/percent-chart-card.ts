import { PercentPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TuiArcChart } from '@taiga-ui/addon-charts';
import { TuiCell, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiTooltip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-percent-chart-card',
  templateUrl: './percent-chart-card.html',
  styleUrl: './percent-chart-card.css',
  imports: [
    PercentPipe,
    TuiArcChart,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiIcon,
    TuiTitle,
    TuiTooltip,
  ],
})
export class PercentChartCard {
  readonly title = input.required<string>();
  readonly value = input.required<number | null>();

  readonly tooltip = input<string>();
}
