import { Car } from '@/resources/models/car';
import { ChampionshipWithClasses } from '@/resources/models/championship';
import { CarCard } from '@/championships/car-card/car-card';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-championship-cars-tab',
  templateUrl: './championship-cars-tab.html',
  styleUrl: './championship-cars-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CarCard, TuiHeader],
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
    categoryMap.forEach((cars) => {
      cars.sort(
        (a, b) =>
          a.model!.localeCompare(b.model!) ||
          (a.team_name ?? '').localeCompare(b.team_name ?? '') ||
          a.livery!.localeCompare(b.livery!),
      );
    });
    return categoryMap;
  });
}
