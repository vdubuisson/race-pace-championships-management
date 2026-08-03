import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { DriverRepository } from '@/db/driver-repository';
import { Driver } from '@/shared/models/driver';
import { computed, effect, inject, resource, Service, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';

const ELO_LEVELS = [
  { level: 'F', min: 800, max: 1099 },
  { level: 'E', min: 1100, max: 1199 },
  { level: 'D', min: 1200, max: 1399 },
  { level: 'C', min: 1500, max: 1699 },
  { level: 'B', min: 1700, max: 1999 },
  { level: 'A', min: 2000, max: 2200 },
];

const SKILL_LEVELS = [
  { level: 'Poor', min: 50, max: 70 },
  { level: 'Average', min: 60, max: 80 },
  { level: 'Above average', min: 75, max: 85 },
  { level: 'Good', min: 80, max: 90 },
  { level: 'Very good', min: 85, max: 95 },
  { level: 'Great', min: 90, max: 100 },
];

@Service({ autoProvided: false })
export class DriverFormManager {
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly driverRepository = inject(DriverRepository);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    surname: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    championship_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    team_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    end_year: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    expected_standing: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    team_loyalty: this.newPercentControl(),
    country: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dob: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    elo: new FormControl(1000, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    race_skill: this.newPercentControl(),
    qualifying_skill: this.newPercentControl(),
    aggression: this.newPercentControl(),
    defending: this.newPercentControl(),
    stamina: this.newPercentControl(),
    consistency: this.newPercentControl(),
    start_reactions: this.newPercentControl(),
    wet_skill: this.newPercentControl(),
    tyre_management: this.newPercentControl(),
    fuel_management: this.newPercentControl(),
    blue_flag_conceding: this.newPercentControl(),
    weather_tyre_changes: this.newPercentControl(),
    avoidance_of_mistakes: this.newPercentControl(),
    avoidance_of_forced_mistakes: this.newPercentControl(),
    setup_downforce: this.newPercentControl(),
    setup_downforce_randomness: this.newPercentControl(),
  });

  readonly championships = toSignal(this.championshipRepository.getAllChampionships(), {
    initialValue: [],
  });
  readonly championshipOptions = computed(() =>
    this.championships().map((championship) => championship.name),
  );
  private readonly championshipNameValueChanges = toSignal(
    this.form.controls.championship_name.valueChanges,
    {
      initialValue: this.form.controls.championship_name.value,
    },
  );
  private readonly categoryValueChanges = toSignal(this.form.controls.category.valueChanges, {
    initialValue: this.form.controls.category.value,
  });

  readonly categoryOptions = computed(() => {
    const championshipName = this.championshipNameValueChanges();
    const championship = this.championships().find((c) => c.name === championshipName);
    return championship?.categories ?? [];
  });

  readonly teamOptions = resource({
    params: () => ({
      championshipName: this.championshipNameValueChanges(),
      categoryName: this.categoryValueChanges(),
    }),
    loader: async ({ params: { championshipName, categoryName } }) => {
      if (!championshipName || !categoryName) {
        return [];
      }
      const cars = await this.carRepository.getCarsByChampionshipNameAndCategory(
        championshipName,
        categoryName,
      );
      const teamNamesSet = new Set(cars.map((car) => car.team_name));
      return Array.from(teamNamesSet);
    },
    defaultValue: [],
  });

  readonly eloOptions = ELO_LEVELS.map((elo) => elo.level);
  readonly skillOptions = SKILL_LEVELS.map((skill) => skill.level);

  private readonly loaderDriverId = signal<number | null>(null);

  constructor() {
    this.form.controls.championship_name.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.form.controls.championship_name.dirty) {
        this.form.controls.category.setValue('');
        this.form.controls.category.markAsDirty();
      }
    });

    this.form.controls.category.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.form.controls.category.dirty) {
        this.form.controls.team_name.setValue('');
        this.form.controls.team_name.markAsDirty();
      }
    });

    effect(() => {
      if (this.categoryOptions().length === 0) {
        this.form.controls.category.disable();
      } else {
        this.form.controls.category.enable();
      }
    });

    effect(() => {
      if (this.teamOptions.value().length === 0) {
        this.form.controls.team_name.disable();
      } else {
        this.form.controls.team_name.enable();
      }
    });
  }

  loadDriver(driver?: Driver): void {
    if (!driver?.id) {
      this.form.reset();
      this.loaderDriverId.set(null);
      return;
    }

    this.loaderDriverId.set(driver.id);
    this.form.patchValue({
      ...driver,
      team_loyalty: (driver.team_loyalty ?? 0) * 100,
      race_skill: (driver.race_skill ?? 0) * 100,
      qualifying_skill: (driver.qualifying_skill ?? 0) * 100,
      aggression: (driver.aggression ?? 0) * 100,
      defending: (driver.defending ?? 0) * 100,
      stamina: (driver.stamina ?? 0) * 100,
      consistency: (driver.consistency ?? 0) * 100,
      start_reactions: (driver.start_reactions ?? 0) * 100,
      wet_skill: (driver.wet_skill ?? 0) * 100,
      tyre_management: (driver.tyre_management ?? 0) * 100,
      fuel_management: (driver.fuel_management ?? 0) * 100,
      blue_flag_conceding: (driver.blue_flag_conceding ?? 0) * 100,
      weather_tyre_changes: (driver.weather_tyre_changes ?? 0) * 100,
      avoidance_of_mistakes: (driver.avoidance_of_mistakes ?? 0) * 100,
      avoidance_of_forced_mistakes: (driver.avoidance_of_forced_mistakes ?? 0) * 100,
      setup_downforce: (driver.setup_downforce ?? 0) * 100,
      setup_downforce_randomness: (driver.setup_downforce_randomness ?? 0) * 100,
    });
  }

  async save(): Promise<number> {
    const formValue = this.form.getRawValue();
    const driver = {
      ...formValue,
      team_loyalty: formValue.team_loyalty / 100,
      race_skill: formValue.race_skill / 100,
      qualifying_skill: formValue.qualifying_skill / 100,
      aggression: formValue.aggression / 100,
      defending: formValue.defending / 100,
      stamina: formValue.stamina / 100,
      consistency: formValue.consistency / 100,
      start_reactions: formValue.start_reactions / 100,
      wet_skill: formValue.wet_skill / 100,
      tyre_management: formValue.tyre_management / 100,
      fuel_management: formValue.fuel_management / 100,
      blue_flag_conceding: formValue.blue_flag_conceding / 100,
      weather_tyre_changes: formValue.weather_tyre_changes / 100,
      avoidance_of_mistakes: formValue.avoidance_of_mistakes / 100,
      avoidance_of_forced_mistakes: formValue.avoidance_of_forced_mistakes / 100,
      setup_downforce: formValue.setup_downforce / 100,
      setup_downforce_randomness: formValue.setup_downforce_randomness / 100,
    };
    const driverId = this.loaderDriverId();
    if (driverId) {
      await this.driverRepository.updateDriver(driverId, driver);
      return driverId;
    }
    return this.driverRepository.addDriver(driver);
  }

  setRandomElo(level: string): void {
    const eloLevel = ELO_LEVELS.find((elo) => elo.level === level);
    if (!eloLevel) {
      throw new Error(`Invalid ELO level: ${level}`);
    }
    const { min, max } = eloLevel;
    const randomElo = this.getRandomValue(min, max);
    this.form.controls.elo.setValue(randomElo);
  }

  setRandomSkills(level: string): void {
    const skillLevel = SKILL_LEVELS.find((skill) => skill.level === level);
    if (!skillLevel) {
      throw new Error(`Invalid skill level: ${level}`);
    }
    const { min, max } = skillLevel;
    this.form.controls.race_skill.setValue(this.getRandomValue(min, max));
    this.form.controls.qualifying_skill.setValue(this.getRandomValue(min, max));
    this.form.controls.aggression.setValue(this.getRandomValue(min, max));
    this.form.controls.defending.setValue(this.getRandomValue(min, max));
    this.form.controls.stamina.setValue(this.getRandomValue(min, max));
    this.form.controls.consistency.setValue(this.getRandomValue(min, max));
    this.form.controls.start_reactions.setValue(this.getRandomValue(min, max));
    this.form.controls.wet_skill.setValue(this.getRandomValue(min, max));
    this.form.controls.tyre_management.setValue(this.getRandomValue(min, max));
    this.form.controls.fuel_management.setValue(this.getRandomValue(min, max));
    this.form.controls.blue_flag_conceding.setValue(this.getRandomValue(min, max));
    this.form.controls.weather_tyre_changes.setValue(this.getRandomValue(min, max));
    this.form.controls.avoidance_of_mistakes.setValue(this.getRandomValue(min, max));
    this.form.controls.avoidance_of_forced_mistakes.setValue(this.getRandomValue(min, max));
  }

  private newPercentControl(): FormControl<number> {
    return new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    });
  }

  private getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
