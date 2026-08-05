import { Driver } from '@/shared/models/driver';
import { computed, linkedSignal, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';

@Service({ autoProvided: false })
export class DriversTableFilters {
  readonly drivers = signal<Driver[]>([]);

  readonly championshipOptions = computed(() => {
    const championshipsSet = new Set<string>();
    this.drivers()
      .map((driver) => driver.championship_name)
      .filter((championshipName) => championshipName?.length)
      .forEach((championshipName) => championshipsSet.add(championshipName));
    return Array.from(championshipsSet).toSorted();
  });

  readonly categoryOptions = computed(() => {
    const categoriesSet = new Set<string>();
    this.drivers()
      .map((driver) => driver.category)
      .filter((category) => category?.length)
      .forEach((category) => categoriesSet.add(category));
    return Array.from(categoriesSet).toSorted();
  });

  readonly teamOptions = computed(() => {
    const teamsSet = new Set<string>();
    this.drivers()
      .map((driver) => driver.team_name)
      .filter((teamName) => teamName?.length)
      .forEach((teamName) => teamsSet.add(teamName));
    return Array.from(teamsSet).toSorted();
  });

  readonly endYearOptions = computed(() => {
    const endYearsSet = new Set<number>();
    this.drivers()
      .map((driver) => driver.end_year)
      .filter((endYear) => endYear !== null)
      .forEach((endYear) => endYearsSet.add(endYear));

    return Array.from(endYearsSet).toSorted();
  });

  readonly form = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    championshipName: new FormControl(''),
    category: new FormControl(''),
    teamName: new FormControl(''),
    endYear: new FormControl<number | null>(null),
    elo: new FormControl<number | null>(null),
  });

  readonly filteredDrivers = linkedSignal(() => this.applyFilters(this.drivers()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const filtered = this.applyFilters(this.drivers());
      this.filteredDrivers.set(filtered);
    });
  }

  private applyFilters(drivers: Driver[]): Driver[] {
    let filtered = [...drivers];

    const nameFilter = this.form.controls.name.value || '';
    const surnameFilter = this.form.controls.surname.value || '';
    const championshipNameFilter = this.form.controls.championshipName.value || '';
    const categoryFilter = this.form.controls.category.value || '';
    const teamNameFilter = this.form.controls.teamName.value || '';
    const endYearFilter = this.form.controls.endYear.value;
    const eloFilter = this.form.controls.elo.value;

    if (nameFilter?.length > 0) {
      filtered = filtered.filter((driver) =>
        driver.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }

    if (surnameFilter?.length > 0) {
      filtered = filtered.filter((driver) =>
        driver.surname.toLowerCase().includes(surnameFilter.toLowerCase()),
      );
    }

    if (championshipNameFilter?.length > 0) {
      filtered = filtered.filter((driver) => driver.championship_name === championshipNameFilter);
    }

    if (categoryFilter?.length > 0) {
      filtered = filtered.filter((driver) => driver.category === categoryFilter);
    }

    if (teamNameFilter?.length > 0) {
      filtered = filtered.filter((driver) => driver.team_name === teamNameFilter);
    }

    if (endYearFilter !== null) {
      filtered = filtered.filter((driver) => driver.end_year === endYearFilter);
    }

    if (eloFilter !== null) {
      filtered = filtered.filter((driver) => driver.elo.toString().includes(eloFilter.toString()));
    }

    return filtered;
  }
}
