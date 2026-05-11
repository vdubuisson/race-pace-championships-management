import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Championship } from '@/resources/models/championship';
import { TuiCardLarge, TuiHeader, TuiItemGroup, TuiList } from '@taiga-ui/layout';
import { TuiCell, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { DatePipe, I18nPluralPipe, TitleCasePipe } from '@angular/common';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';

@Component({
  selector: 'app-championship-global-tab',
  templateUrl: './championship-global-tab.html',
  styleUrl: './championship-global-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
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
    TuiIcon,
    TuiItemGroup,
    TuiList,
    TuiTitle,
  ],
})
export default class ChampionshipGlobalTab {
  readonly championship = input.required<Championship>();
}
