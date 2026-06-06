import { ChampionshipWithClasses } from '@/shared/models/championship';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { I18nPluralPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiCell, TuiHint, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiItemGroup, TuiList } from '@taiga-ui/layout';

@Component({
  selector: 'app-championship-global-tab',
  templateUrl: './championship-global-tab.html',
  styleUrl: './championship-global-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    I18nPluralPipe,
    MonthPipe,
    OrdinalPipe,
    TitleCasePipe,
    TuiAutoColorPipe,
    TuiCardLarge,
    TuiCell,
    TuiChip,
    TuiHeader,
    TuiHint,
    TuiIcon,
    TuiItemGroup,
    TuiList,
    TuiTitle,
  ],
})
export default class ChampionshipGlobalTab {
  readonly championship = input.required<ChampionshipWithClasses>();
}
