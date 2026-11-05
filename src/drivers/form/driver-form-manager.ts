import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { DriverRepository } from '@/db/driver-repository';
import { Driver } from '@/shared/models/driver';
import {
  computed,
  effect,
  inject,
  linkedSignal,
  resource,
  Service,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { disabled, FieldTree, form, max, min, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TuiDay } from '@taiga-ui/cdk';
import { TuiNotificationService } from '@taiga-ui/core';

type DriverModel = Omit<Driver, 'id' | 'dob'> & {
  dob: TuiDay | null;
};

const EMPTY_DRIVER: DriverModel = {
  name: '',
  surname: '',
  championship_name: '',
  category: '',
  team_name: '',
  end_year: new Date().getFullYear(),
  expected_standing: 1,
  team_loyalty: 50,
  country: '',
  dob: null,
  elo: 1000,
  race_skill: 50,
  qualifying_skill: 50,
  aggression: 50,
  defending: 50,
  stamina: 50,
  consistency: 50,
  start_reactions: 50,
  wet_skill: 50,
  tyre_management: 50,
  fuel_management: 50,
  blue_flag_conceding: 50,
  weather_tyre_changes: 50,
  avoidance_of_mistakes: 50,
  avoidance_of_forced_mistakes: 50,
  setup_downforce: 50,
  setup_downforce_randomness: 50,
};

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
  private readonly notifications = inject(TuiNotificationService);
  private readonly router = inject(Router);

  readonly canDeactivate = linkedSignal(() => !this.driverForm().dirty());

  readonly existingDriverId = signal<number>(NaN);

  private readonly existingDriver = resource({
    params: () => this.existingDriverId(),
    loader: async ({ params: id }) => {
      if (!isNaN(id)) {
        return this.driverRepository.getDriverById(id);
      }
      return null;
    },
    defaultValue: null,
  });

  readonly existingDriverName = computed(() => {
    const driver = this.existingDriver.value();
    return driver ? `${driver.name} ${driver.surname}`.trim() : '';
  });

  readonly isEditMode = computed(() => !isNaN(this.existingDriverId()));

  private readonly driverModel = linkedSignal<Driver | null | undefined, DriverModel>({
    source: this.existingDriver.value,
    computation: (existingDriver) =>
      existingDriver ? this.driverToDriverModel(existingDriver) : { ...EMPTY_DRIVER },
  });

  readonly driverForm = form(
    this.driverModel,
    (schemaPath) => {
      disabled(schemaPath, { when: () => this.existingDriver.isLoading() });

      required(schemaPath.name, { message: 'Name is required' });
      required(schemaPath.surname, { message: 'Surname is required' });
      required(schemaPath.championship_name, { message: 'Championship is required' });
      required(schemaPath.country, { message: 'Country is required' });
      required(schemaPath.dob, { message: 'Date of birth is required' });

      required(schemaPath.category, { message: 'Category is required' });
      disabled(schemaPath.category, { when: () => this.categoryOptions().length === 0 });

      required(schemaPath.team_name, { message: 'Team is required' });
      disabled(schemaPath.team_name, { when: () => this.teamOptions.value().length === 0 });

      required(schemaPath.end_year, { message: 'End year is required' });
      min(schemaPath.end_year, 0, { message: 'End year must be at least 0' });

      required(schemaPath.expected_standing, { message: 'Expected standing is required' });
      min(schemaPath.expected_standing, 1, { message: 'Expected standing must be at least 1' });

      required(schemaPath.elo, { message: 'Elo is required' });
      min(schemaPath.elo, 0, { message: 'Elo must be at least 0' });

      required(schemaPath.team_loyalty, { message: 'Team loyalty is required' });
      min(schemaPath.team_loyalty, 0, { message: 'Team loyalty must be at least 0' });
      max(schemaPath.team_loyalty, 100, { message: 'Team loyalty must be at most 100' });

      required(schemaPath.race_skill, { message: 'Race skill is required' });
      min(schemaPath.race_skill, 0, { message: 'Race skill must be at least 0' });
      max(schemaPath.race_skill, 100, { message: 'Race skill must be at most 100' });

      required(schemaPath.qualifying_skill, { message: 'Qualifying skill is required' });
      min(schemaPath.qualifying_skill, 0, { message: 'Qualifying skill must be at least 0' });
      max(schemaPath.qualifying_skill, 100, { message: 'Qualifying skill must be at most 100' });

      required(schemaPath.aggression, { message: 'Aggression is required' });
      min(schemaPath.aggression, 0, { message: 'Aggression must be at least 0' });
      max(schemaPath.aggression, 100, { message: 'Aggression must be at most 100' });

      required(schemaPath.defending, { message: 'Defending is required' });
      min(schemaPath.defending, 0, { message: 'Defending must be at least 0' });
      max(schemaPath.defending, 100, { message: 'Defending must be at most 100' });

      required(schemaPath.stamina, { message: 'Stamina is required' });
      min(schemaPath.stamina, 0, { message: 'Stamina must be at least 0' });
      max(schemaPath.stamina, 100, { message: 'Stamina must be at most 100' });

      required(schemaPath.consistency, { message: 'Consistency is required' });
      min(schemaPath.consistency, 0, { message: 'Consistency must be at least 0' });
      max(schemaPath.consistency, 100, { message: 'Consistency must be at most 100' });

      required(schemaPath.start_reactions, { message: 'Start reactions is required' });
      min(schemaPath.start_reactions, 0, { message: 'Start reactions must be at least 0' });
      max(schemaPath.start_reactions, 100, { message: 'Start reactions must be at most 100' });

      required(schemaPath.wet_skill, { message: 'Wet skill is required' });
      min(schemaPath.wet_skill, 0, { message: 'Wet skill must be at least 0' });
      max(schemaPath.wet_skill, 100, { message: 'Wet skill must be at most 100' });

      required(schemaPath.tyre_management, { message: 'Tyre management is required' });
      min(schemaPath.tyre_management, 0, { message: 'Tyre management must be at least 0' });
      max(schemaPath.tyre_management, 100, { message: 'Tyre management must be at most 100' });

      required(schemaPath.fuel_management, { message: 'Fuel management is required' });
      min(schemaPath.fuel_management, 0, { message: 'Fuel management must be at least 0' });
      max(schemaPath.fuel_management, 100, { message: 'Fuel management must be at most 100' });

      required(schemaPath.blue_flag_conceding, { message: 'Blue flag conceding is required' });
      min(schemaPath.blue_flag_conceding, 0, { message: 'Blue flag conceding must be at least 0' });
      max(schemaPath.blue_flag_conceding, 100, {
        message: 'Blue flag conceding must be at most 100',
      });

      required(schemaPath.weather_tyre_changes, { message: 'Weather tyre changes is required' });
      min(schemaPath.weather_tyre_changes, 0, {
        message: 'Weather tyre changes must be at least 0',
      });
      max(schemaPath.weather_tyre_changes, 100, {
        message: 'Weather tyre changes must be at most 100',
      });

      required(schemaPath.avoidance_of_mistakes, { message: 'Avoidance of mistakes is required' });
      min(schemaPath.avoidance_of_mistakes, 0, {
        message: 'Avoidance of mistakes must be at least 0',
      });
      max(schemaPath.avoidance_of_mistakes, 100, {
        message: 'Avoidance of mistakes must be at most 100',
      });

      required(schemaPath.avoidance_of_forced_mistakes, {
        message: 'Avoidance of forced mistakes is required',
      });
      min(schemaPath.avoidance_of_forced_mistakes, 0, {
        message: 'Avoidance of forced mistakes must be at least 0',
      });
      max(schemaPath.avoidance_of_forced_mistakes, 100, {
        message: 'Avoidance of forced mistakes must be at most 100',
      });

      required(schemaPath.setup_downforce, { message: 'Setup downforce is required' });
      min(schemaPath.setup_downforce, 0, { message: 'Setup downforce must be at least 0' });
      max(schemaPath.setup_downforce, 100, { message: 'Setup downforce must be at most 100' });

      required(schemaPath.setup_downforce_randomness, {
        message: 'Setup downforce randomness is required',
      });
      min(schemaPath.setup_downforce_randomness, 0, {
        message: 'Setup downforce randomness must be at least 0',
      });
      max(schemaPath.setup_downforce_randomness, 100, {
        message: 'Setup downforce randomness must be at most 100',
      });
    },
    {
      submission: {
        action: (fieldTree) => this.save(fieldTree),
      },
    },
  );

  readonly championships = toSignal(this.championshipRepository.getAllChampionships(), {
    initialValue: [],
  });
  readonly championshipOptions = computed(() =>
    this.championships().map((championship) => championship.name),
  );

  readonly categoryOptions = computed(() => {
    const championshipName = this.driverForm.championship_name().value();
    const championship = this.championships().find((c) => c.name === championshipName);
    return championship?.categories ?? [];
  });

  readonly teamOptions = resource({
    params: () => ({
      championshipName: this.driverForm.championship_name().value(),
      categoryName: this.driverForm.category().value(),
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

  constructor() {
    effect(() => {
      const championshipNameValue = this.driverForm.championship_name().value();
      if (untracked(() => this.driverForm.championship_name().dirty())) {
        this.driverForm.category().value.set('');
        this.driverForm.category().markAsDirty();
      }
    });
    effect(() => {
      const categoryValue = this.driverForm.category().value();
      if (untracked(() => this.driverForm.category().dirty())) {
        this.driverForm.team_name().value.set('');
        this.driverForm.team_name().markAsDirty();
      }
    });
  }

  async save(form: FieldTree<DriverModel>): Promise<void> {
    try {
      const driverToSave = this.driverModelToDriver(form().value());
      let driverId = this.existingDriverId();
      if (!isNaN(driverId)) {
        await this.driverRepository.updateDriver(driverId, driverToSave);
      } else {
        driverId = await this.driverRepository.addDriver(driverToSave);
      }
      this.canDeactivate.set(true);
      this.notifications
        .open(this.isEditMode() ? 'Driver updated' : 'Driver created', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();

      await this.router.navigate(['/drivers/details', driverId]);
    } catch (error) {
      console.error('Failed to save driver', error);
      this.notifications
        .open('Failed to save driver', {
          appearance: 'negative',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
    }
  }

  setRandomElo(level: string): void {
    const eloLevel = ELO_LEVELS.find((elo) => elo.level === level);
    if (!eloLevel) {
      throw new Error(`Invalid ELO level: ${level}`);
    }
    const { min, max } = eloLevel;
    const randomElo = this.getRandomValue(min, max);
    this.driverForm.elo().value.set(randomElo);
  }

  setRandomSkills(level: string): void {
    const skillLevel = SKILL_LEVELS.find((skill) => skill.level === level);
    if (!skillLevel) {
      throw new Error(`Invalid skill level: ${level}`);
    }
    const { min, max } = skillLevel;
    this.driverForm.race_skill().value.set(this.getRandomValue(min, max));
    this.driverForm.qualifying_skill().value.set(this.getRandomValue(min, max));
    this.driverForm.aggression().value.set(this.getRandomValue(min, max));
    this.driverForm.defending().value.set(this.getRandomValue(min, max));
    this.driverForm.stamina().value.set(this.getRandomValue(min, max));
    this.driverForm.consistency().value.set(this.getRandomValue(min, max));
    this.driverForm.start_reactions().value.set(this.getRandomValue(min, max));
    this.driverForm.wet_skill().value.set(this.getRandomValue(min, max));
    this.driverForm.tyre_management().value.set(this.getRandomValue(min, max));
    this.driverForm.fuel_management().value.set(this.getRandomValue(min, max));
    this.driverForm.blue_flag_conceding().value.set(this.getRandomValue(min, max));
    this.driverForm.weather_tyre_changes().value.set(this.getRandomValue(min, max));
    this.driverForm.avoidance_of_mistakes().value.set(this.getRandomValue(min, max));
    this.driverForm.avoidance_of_forced_mistakes().value.set(this.getRandomValue(min, max));
  }

  private getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private driverToDriverModel(driver: Driver): DriverModel {
    return {
      ...driver,
      dob: this.stringToTuiDay(driver.dob),
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
    };
  }

  private driverModelToDriver(driverModel: DriverModel): Driver {
    return {
      ...driverModel,
      dob: this.tuiDayToString(driverModel.dob!),
      team_loyalty: (driverModel.team_loyalty ?? 0) / 100,
      race_skill: (driverModel.race_skill ?? 0) / 100,
      qualifying_skill: (driverModel.qualifying_skill ?? 0) / 100,
      aggression: (driverModel.aggression ?? 0) / 100,
      defending: (driverModel.defending ?? 0) / 100,
      stamina: (driverModel.stamina ?? 0) / 100,
      consistency: (driverModel.consistency ?? 0) / 100,
      start_reactions: (driverModel.start_reactions ?? 0) / 100,
      wet_skill: (driverModel.wet_skill ?? 0) / 100,
      tyre_management: (driverModel.tyre_management ?? 0) / 100,
      fuel_management: (driverModel.fuel_management ?? 0) / 100,
      blue_flag_conceding: (driverModel.blue_flag_conceding ?? 0) / 100,
      weather_tyre_changes: (driverModel.weather_tyre_changes ?? 0) / 100,
      avoidance_of_mistakes: (driverModel.avoidance_of_mistakes ?? 0) / 100,
      avoidance_of_forced_mistakes: (driverModel.avoidance_of_forced_mistakes ?? 0) / 100,
      setup_downforce: (driverModel.setup_downforce ?? 0) / 100,
      setup_downforce_randomness: (driverModel.setup_downforce_randomness ?? 0) / 100,
    };
  }

  private stringToTuiDay(dateString: string | null): TuiDay | null {
    if (!dateString) {
      return null;
    }
    const [year, month, day] = dateString.split('-').map(Number);
    return new TuiDay(year, month - 1, day);
  }

  private tuiDayToString(tuiDay: TuiDay): string {
    const year = tuiDay.year;
    const month = String(tuiDay.month + 1).padStart(2, '0');
    const date = String(tuiDay.day).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }
}
