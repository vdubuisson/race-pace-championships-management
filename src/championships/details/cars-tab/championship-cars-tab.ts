import { Car } from '@/shared/models/car';
import { ChampionshipWithClasses } from '@/shared/models/championship';
import { CarCard } from '@/championships/car-card/car-card';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { Livery } from '@/shared/models/livery';

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
  readonly liveries = input.required<Livery[]>();

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

  readonly isCarsMods = computed<Map<number, boolean>>(() => {
    const map = new Map<number, boolean>();
    for (const car of this.cars()) {
      const isMod = this.liveries().find(
        (livery) =>
          livery.class === car.category &&
          livery.car_name === car.model &&
          livery.livery_name === car.livery,
      )?.is_mod;
      map.set(car.id!, isMod ?? false);
    }
    return map;
  });
}
