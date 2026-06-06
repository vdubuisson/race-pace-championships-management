import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { EventRepository } from '@/db/event-repository';
import { LiveryRepository } from '@/db/livery-repository';
import { TeamRepository } from '@/db/team-repository';
import { TrackRepository } from '@/db/track-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { Car } from '@/shared/models/car';
import { Championship } from '@/shared/models/championship';
import { RaceEvent } from '@/shared/models/race-event';
import { VehicleClass } from '@/shared/models/vehicle-class';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AsyncValidatorFn, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { ChampionshipsService } from '../championships-service/championships-service';

export type GlobalFormGroup = FormGroup<{
  name: FormControl<string>;
  categories: FormControl<VehicleClass[]>;
  prestige: FormControl<number>;
  init_month: FormControl<number>;
  init_day: FormControl<number>;
  registration_start_month: FormControl<number>;
  registration_start_day: FormControl<number>;
  registration_end_month: FormControl<number>;
  registration_end_day: FormControl<number>;
  points: FormArray<FormControl<number>>;
  pit_stop: FormControl<boolean>;
  start_type: FormControl<'standing' | 'rolling'>;
  events_count: FormControl<number>;
  tags: FormControl<string[]>;
  start_year: FormControl<number | null>;
  end_year: FormControl<number | null>;
  default_included: FormControl<boolean>;
}>;

@Injectable()
export class ChampionshipsFormManager {
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly eventRepository = inject(EventRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly liveryRepository = inject(LiveryRepository);
  private readonly trackRepository = inject(TrackRepository);
  private readonly teamRepository = inject(TeamRepository);
  private readonly vehicleClassRepository = inject(VehicleClassRepository);
  private readonly championshipsService = inject(ChampionshipsService);

  readonly isSaving = signal(false);
  readonly tracks = toSignal(from(this.trackRepository.getAllTracks()), { initialValue: [] });
  readonly teams = toSignal(from(this.teamRepository.getAllTeams()), { initialValue: [] });
  readonly vehicleClasses = toSignal(from(this.vehicleClassRepository.getAllVehicleClasses()), {
    initialValue: [],
  });
  readonly championshipEvents = signal<RaceEvent[]>([]);
  readonly championshipCars = signal<Car[]>([]);
  readonly championshipClasses = signal<VehicleClass[]>([]);
  readonly liveriesForSelectedClasses = linkedSignal(() => {
    const selectedCategoriesIds = this.globalForm.controls.categories.value.map((cat) => cat.id);
    if (selectedCategoriesIds.length === 0) {
      return [];
    }
    return toSignal(from(this.liveryRepository.getLiveriesByClasses(selectedCategoriesIds)), {
      initialValue: [],
    })();
  });

  private readonly championshipNameAvailableValidator: AsyncValidatorFn = async (control) => {
    const name = control.value?.trim();

    if (!name) {
      return null;
    }

    const existingChampionship = await this.championshipRepository.getChampionshipByName(name);

    if (!existingChampionship) {
      return null;
    }

    const currentChampionshipId = this.loadedChampionshipId();

    if (
      currentChampionshipId !== null &&
      !isNaN(currentChampionshipId) &&
      existingChampionship.id === currentChampionshipId
    ) {
      return null;
    }

    return { championshipNameTaken: 'This championship name is already taken' };
  };

  readonly minTracksGarages = computed(() =>
    Math.min(
      ...this.championshipEvents()
        .map((event) => event.track_id)
        .map((trackId) => this.tracks().find((track) => track.id === trackId)?.garages ?? 0),
    ),
  );

  readonly globalForm: GlobalFormGroup = this.createGlobalForm();

  readonly globalFormValid = signal(this.globalForm.valid);
  readonly eventsFormValid = linkedSignal(
    () => this.championshipEvents().length >= this.globalForm.controls.events_count.value,
  );
  readonly carsFormValid = computed(
    () =>
      this.championshipCars().length > 0 &&
      this.championshipCars().length <= this.minTracksGarages(),
  );
  readonly allFormsValid = computed(
    () => this.globalFormValid() && this.eventsFormValid() && this.carsFormValid(),
  );

  readonly championshipName = computed(() => this.globalForm.controls.name.value || 'championship');

  private readonly loadedChampionshipId = signal<number | null>(null);
  private readonly originalChampionshipName = signal<string | null>(null);

  constructor() {
    this.globalForm.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((status) => this.globalFormValid.set(status === 'VALID'));
    this.globalForm.controls.events_count.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.eventsFormValid.set(this.championshipEvents().length >= value));
    this.globalForm.controls.categories.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(async (value) => {
        this.championshipClasses.set(value);

        if (value.length === 0) {
          this.liveriesForSelectedClasses.set([]);
          return;
        }
        const selectedCategoriesIds = value.map((cat) => cat.id);
        const liveries = await this.liveryRepository.getLiveriesByClasses(selectedCategoriesIds);
        this.liveriesForSelectedClasses.set(liveries);
      });
  }

  loadChampionshipInForm(championship?: Championship): void {
    if (!championship?.id) {
      this.loadedChampionshipId.set(null);
      this.originalChampionshipName.set(null);
      this.resetForm();
      return;
    }

    if (this.loadedChampionshipId() === championship.id) {
      return;
    }

    this.loadedChampionshipId.set(championship.id ?? null);
    this.originalChampionshipName.set(championship.name);

    // Use setTimeout to avoid multiple validation calls and form state staying PENDING
    setTimeout(async () => {
      const vehicleClasses = await this.vehicleClassRepository.getAllVehicleClasses();
      this.globalForm.patchValue({
        name: championship.name,
        tags: championship.tags,
        categories: championship.categories
          .map((catId) => vehicleClasses.find((cat) => cat.id === catId))
          .filter(Boolean) as VehicleClass[],
        prestige: championship.prestige,
        init_month: championship.init_month,
        init_day: championship.init_day,
        registration_start_month: championship.registration_start_month,
        registration_start_day: championship.registration_start_day,
        registration_end_month: championship.registration_end_month,
        registration_end_day: championship.registration_end_day,
        pit_stop: championship.pit_stop,
        start_type: championship.start_type,
        events_count: championship.events_count,
        start_year: championship.start_year,
        end_year: championship.end_year,
        default_included: championship.default_included,
      });
    });

    this.fillNumberFormArray(this.globalForm.controls.points, championship.points);

    this.eventRepository
      .getEventsByChampionshipName(championship.name)
      .then((events) => this.championshipEvents.set(events));
    this.carRepository
      .getCarsByChampionshipName(championship.name)
      .then((cars) => this.championshipCars.set(cars));
  }

  async save(): Promise<number> {
    this.isSaving.set(true);

    try {
      const championship = this.buildChampionship();
      const events = this.championshipEvents().map((event) => ({
        ...event,
        id: (event.id ?? -1) >= 0 ? event.id : undefined,
      }));
      const cars = this.championshipCars().map((car) => ({
        ...car,
        id: (car.id ?? -1) >= 0 ? car.id : undefined,
      }));

      return await this.championshipsService.saveChampionshipWithRelations({
        championship,
        events,
        cars,
        id: this.loadedChampionshipId() ?? undefined,
        previousName: this.originalChampionshipName() ?? undefined,
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  private createGlobalForm(): GlobalFormGroup {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
        asyncValidators: [this.championshipNameAvailableValidator],
        updateOn: 'blur',
      }),
      categories: new FormControl<VehicleClass[]>([], {
        nonNullable: true,
        validators: [Validators.required],
      }),
      prestige: new FormControl(30, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      init_month: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      init_day: new FormControl(3, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(31)],
      }),
      registration_start_month: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      registration_start_day: new FormControl(12, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(31)],
      }),
      registration_end_month: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      registration_end_day: new FormControl(19, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(31)],
      }),
      points: new FormArray(
        [
          new FormControl(25, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(0)],
          }),
        ],
        { validators: [Validators.required] },
      ),
      pit_stop: new FormControl(false, { nonNullable: true }),
      start_type: new FormControl<'standing' | 'rolling'>('standing', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      events_count: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      tags: new FormControl<string[]>([], { nonNullable: true }),
      start_year: new FormControl<number | null>(null),
      end_year: new FormControl<number | null>(null),
      default_included: new FormControl(false, { nonNullable: true }),
    });
  }

  private fillNumberFormArray(target: FormArray<FormControl<number>>, values: number[]): void {
    const formControls = values.map(
      (value) =>
        new FormControl(value, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(0)],
        }),
    );

    target.clear({ emitEvent: false });
    target.push(formControls);
  }

  private resetForm(): void {
    this.globalForm.reset();
    this.championshipEvents.set([]);
    this.championshipCars.set([]);
  }

  private buildChampionship(): Championship {
    const rawValue = this.globalForm.getRawValue();

    const categoriesIds = rawValue.categories
      .filter((cat) => this.championshipCars().some((car) => car.category === cat.id))
      .map((cat) => cat.id);

    const hasTrackMods = this.championshipEvents()
      .map((event) => this.tracks().find((track) => track.id === event.track_id))
      .some((track) => track?.is_mod);
    const hasCarMods = this.championshipCars()
      .map((car) =>
        this.liveriesForSelectedClasses().find(
          (livery) =>
            livery.class === car.category &&
            livery.car_name === car.model &&
            livery.livery_name === car.livery,
        ),
      )
      .some((livery) => livery?.is_mod);

    const tags = new Set(
      rawValue.tags.map((value) => value.trim()).filter((value) => value.length > 0),
    );
    if (hasTrackMods) {
      tags.add('Track mods');
    } else {
      tags.delete('Track mods');
    }
    if (hasCarMods) {
      tags.add('Car mods');
    } else {
      tags.delete('Car mods');
    }

    return {
      id: this.loadedChampionshipId() ?? undefined,
      name: rawValue.name.trim(),
      categories: categoriesIds,
      prestige: rawValue.prestige,
      init_month: rawValue.init_month,
      init_day: rawValue.init_day,
      registration_start_month: rawValue.registration_start_month,
      registration_start_day: rawValue.registration_start_day,
      registration_end_month: rawValue.registration_end_month,
      registration_end_day: rawValue.registration_end_day,
      points: rawValue.points,
      pit_stop: rawValue.pit_stop,
      start_type: rawValue.start_type,
      field_type: this.championshipCars().every(
        (car) => car.model === this.championshipCars()[0]?.model,
      )
        ? 'identical'
        : null,
      events_count: rawValue.events_count,
      tags: Array.from(tags),
      start_year: rawValue.start_year,
      end_year: rawValue.end_year,
      default_included: rawValue.default_included,
    };
  }
}
