import { Team } from '@/shared/models/team';
import { linkedSignal, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';

@Service({ autoProvided: false })
export class TeamsTableFilters {
  readonly teams = signal<Team[]>([]);

  readonly form = new FormGroup({
    name: new FormControl(''),
    driver_loyalty: new FormControl<number | null>(null),
    expectation_level: new FormControl<number | null>(null),
    performance_rating: new FormControl<number | null>(null),
    engineering_weight: new FormControl<number | null>(null),
    engineering_drag: new FormControl<number | null>(null),
    engineering_power: new FormControl<number | null>(null),
    selectedIds: new FormControl<number[]>([], { nonNullable: true }),
  });

  readonly filteredTeams = linkedSignal(() => this.applyFilters(this.teams()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const filtered = this.applyFilters(this.teams());
      this.filteredTeams.set(filtered);
    });
  }

  private applyFilters(teams: Team[]): Team[] {
    let filtered = [...teams];

    const nameFilter = this.form.controls.name.value || '';
    const driverLoyaltyFilter = this.form.controls.driver_loyalty.value;
    const expectationLevelFilter = this.form.controls.expectation_level.value;
    const performanceRatingFilter = this.form.controls.performance_rating.value;
    const engineeringWeightFilter = this.form.controls.engineering_weight.value;
    const engineeringDragFilter = this.form.controls.engineering_drag.value;
    const engineeringPowerFilter = this.form.controls.engineering_power.value;

    if (nameFilter?.length > 0) {
      filtered = filtered.filter((team) =>
        team.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }
    if (driverLoyaltyFilter !== null) {
      filtered = filtered.filter((team) => team.driver_loyalty === driverLoyaltyFilter);
    }
    if (expectationLevelFilter !== null) {
      filtered = filtered.filter((team) => team.expectation_level === expectationLevelFilter);
    }
    if (performanceRatingFilter !== null) {
      filtered = filtered.filter((team) => team.performance_rating === performanceRatingFilter);
    }
    if (engineeringWeightFilter !== null) {
      filtered = filtered.filter((team) => team.engineering_weight === engineeringWeightFilter);
    }
    if (engineeringDragFilter !== null) {
      filtered = filtered.filter((team) => team.engineering_drag === engineeringDragFilter);
    }
    if (engineeringPowerFilter !== null) {
      filtered = filtered.filter((team) => team.engineering_power === engineeringPowerFilter);
    }

    return filtered;
  }
}
