import { LiveryRepository } from '@/db/livery-repository';
import { CarCard } from '@/shared/components/car-card/car-card';
import { Car } from '@/shared/models/car';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { TuiButton, TuiGroup } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-cars-tab',
  templateUrl: './team-cars-tab.html',
  styleUrl: './team-cars-tab.css',
  imports: [CarCard, KeyValuePipe, TuiButton, TuiGroup, TuiHeader, VehicleClassNamePipe],
})
export default class TeamCarsTab {
  private readonly liveryRepository = inject(LiveryRepository);

  readonly cars = input.required<Car[]>();

  protected readonly viewMode = signal<'category' | 'championship'>('championship');

  private readonly liveries = resource({
    params: () => ({ liveryNames: this.cars().map((car) => car.livery) }),
    loader: ({ params }) => this.liveryRepository.getLiveriesByLiveryNames(params.liveryNames),
    defaultValue: [],
  });

  protected readonly carsByCategory = computed(() => {
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
          (a.championship_name ?? '').localeCompare(b.championship_name ?? '') ||
          a.livery!.localeCompare(b.livery!),
      );
    });
    return categoryMap;
  });

  protected readonly carsByChampionship = computed(() => {
    const championshipMap = new Map<string, Car[]>();
    for (const car of this.cars()) {
      if (!championshipMap.has(car.championship_name)) {
        championshipMap.set(car.championship_name, []);
      }
      championshipMap.get(car.championship_name)?.push(car);
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
