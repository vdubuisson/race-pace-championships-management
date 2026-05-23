import { Car } from '@/resources/models/car';
import { ChampionshipWithClasses } from '@/resources/models/championship';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-championship-cars-tab',
  templateUrl: './championship-cars-tab.html',
  styleUrl: './championship-cars-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiAutoColorPipe, TuiCardLarge, TuiChip, TuiHeader, TuiTitle],
})
export default class ChampionshipCarsTab {
  readonly cars = input.required<Car[]>();
  readonly championship = input.required<ChampionshipWithClasses>();

  readonly carsByCategory = computed(() => {
    const categoryMap = new Map<string, Car[]>();
    for (const car of this.cars()) {
      if (!categoryMap.has(car.category)) {
        categoryMap.set(car.category, []);
      }
      categoryMap.get(car.category)?.push(car);
    }
    return categoryMap;
  });
}
