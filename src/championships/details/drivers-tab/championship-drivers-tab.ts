import { DriverCard } from '@/shared/components/driver-card/driver-card';
import { Championship } from '@/shared/models/championship';
import { Driver } from '@/shared/models/driver';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { Component, computed, input } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-championship-drivers-tab',
  templateUrl: './championship-drivers-tab.html',
  styleUrl: './championship-drivers-tab.css',
  imports: [DriverCard, TuiHeader, VehicleClassNamePipe],
})
export default class ChampionshipDriversTab {
  readonly drivers = input.required<Driver[]>();
  readonly championship = input.required<Championship>();

  readonly driversByCategory = computed(() => {
    const categoryMap = new Map<string, Driver[]>();
    for (const driver of this.drivers()) {
      if (!categoryMap.has(driver.category)) {
        categoryMap.set(driver.category, []);
      }
      categoryMap.get(driver.category)?.push(driver);
    }
    categoryMap.forEach((drivers) => {
      drivers.sort(
        (a, b) => a.team_name!.localeCompare(b.team_name!) || a.name!.localeCompare(b.name!),
      );
    });
    return categoryMap;
  });
}
