import { DriverCard } from '@/shared/components/driver-card/driver-card';
import { Driver } from '@/shared/models/driver';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { KeyValuePipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { TuiButton, TuiGroup } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-drivers-tab',
  templateUrl: './team-drivers-tab.html',
  styleUrl: './team-drivers-tab.css',
  imports: [DriverCard, KeyValuePipe, TuiButton, TuiGroup, TuiHeader, VehicleClassNamePipe],
})
export default class TeamDriversTab {
  readonly drivers = input.required<Driver[]>();

  protected readonly viewMode = signal<'category' | 'championship'>('championship');

  protected readonly driversByCategory = computed(() => {
    const categoryMap = new Map<string, Driver[]>();
    for (const driver of this.drivers()) {
      if (!categoryMap.has(driver.category)) {
        categoryMap.set(driver.category, []);
      }
      categoryMap.get(driver.category)?.push(driver);
    }
    categoryMap.forEach((drivers) => {
      drivers.sort(
        (a, b) =>
          a.surname!.localeCompare(b.surname!) ||
          (a.championship_name ?? '').localeCompare(b.championship_name ?? '') ||
          a.team_name!.localeCompare(b.team_name!),
      );
    });
    return categoryMap;
  });

  protected readonly driversByChampionship = computed(() => {
    const championshipMap = new Map<string, Driver[]>();
    for (const driver of this.drivers()) {
      if (!championshipMap.has(driver.championship_name)) {
        championshipMap.set(driver.championship_name, []);
      }
      championshipMap.get(driver.championship_name)?.push(driver);
    }
    championshipMap.forEach((drivers) => {
      drivers.sort(
        (a, b) =>
          a.surname!.localeCompare(b.surname!) ||
          (a.team_name ?? '').localeCompare(b.team_name ?? ''),
      );
    });
    return championshipMap;
  });
}
