import { Championship } from '@/shared/models/championship';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { VehicleClassModPipe } from '@/shared/pipes/vehicle-class-mod/vehicle-class-mod-pipe';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { I18nPluralPipe, TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TuiCell, TuiHint, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiItemGroup, TuiList } from '@taiga-ui/layout';

@Component({
  selector: 'app-championship-global-tab',
  templateUrl: './championship-global-tab.html',
  styleUrl: './championship-global-tab.css',
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
    VehicleClassModPipe,
    VehicleClassNamePipe,
  ],
})
export default class ChampionshipGlobalTab {
  readonly championship = input.required<Championship>();
}
