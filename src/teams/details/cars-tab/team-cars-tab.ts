import { LiveryRepository } from '@/db/livery-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { CarCard } from '@/shared/components/car-card/car-card';
import { Car } from '@/shared/models/car';
import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { TuiButton, TuiGroup } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-cars-tab',
  templateUrl: './team-cars-tab.html',
  styleUrl: './team-cars-tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CarCard, KeyValuePipe, TuiButton, TuiGroup, TuiHeader],
})
export default class TeamCarsTab {
  private readonly vehicleClassRepository = inject(VehicleClassRepository);
  private readonly liveryRepository = inject(LiveryRepository);

  readonly cars = input.required<Car[]>();

  protected readonly viewMode = signal<'category' | 'championship'>('championship');

  private readonly categoryIds = computed(() => {
    const categoriesSet = new Set<string>();
    for (const car of this.cars()) {
      categoriesSet.add(car.category);
    }
    return Array.from(categoriesSet);
  });

  private readonly categories = resource({
    params: () => ({ ids: this.categoryIds() }),
    loader: ({ params }) => this.vehicleClassRepository.getVehicleClassesByIds(params.ids),
    defaultValue: [],
  });

  private readonly liveries = resource({
    params: () => ({ liveryNames: this.cars().map((car) => car.livery) }),
    loader: ({ params }) => this.liveryRepository.getLiveriesByLiveryNames(params.liveryNames),
    defaultValue: [],
  });

  protected readonly carsByCategory = computed(() => {
    const categoryMap = new Map<string, Car[]>();
    const categories = this.categories.value();
    for (const car of this.cars()) {
      const category = categories.find((c) => c.id === car.category)?.name ?? car.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)?.push(car);
    }
    categoryMap.forEach((cars) => {
      cars.sort(
        (a, b) =>
          a.model!.localeCompare(b.model!) ||
          (a.championship_name ?? '').localeCompare(b.championship_name ?? '') ||
          a.livery!.localeCompare(b.livery!),
      );
    });
    return categoryMap;
  });

  protected readonly carsByChampionship = computed(() => {
    const championshipMap = new Map<string, Car[]>();
    const categories = this.categories.value();
    for (const car of this.cars()) {
      if (!championshipMap.has(car.championship_name)) {
        championshipMap.set(car.championship_name, []);
      }
      championshipMap.get(car.championship_name)?.push({
        ...car,
        category: categories.find((c) => c.id === car.category)?.name ?? car.category,
      });
    }
    championshipMap.forEach((cars) => {
      cars.sort(
        (a, b) =>
          a.model!.localeCompare(b.model!) ||
          a.category!.localeCompare(b.category!) ||
          a.livery!.localeCompare(b.livery!),
      );
    });
    return championshipMap;
  });

  protected readonly isCarsMods = computed<Map<number, boolean>>(() => {
    const map = new Map<number, boolean>();
    for (const car of this.cars()) {
      const isMod = this.liveries
        .value()
        .find(
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
