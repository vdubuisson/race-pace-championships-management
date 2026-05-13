import { AppDatabase } from '@/db/app-database';
import { CarRepository } from '@/db/car-repository';
import { ChampionshipRepository } from '@/db/championship-repository';
import { EventRepository } from '@/db/event-repository';
import { TeamRepository } from '@/db/team-repository';
import { TrackRepository } from '@/db/track-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { Championship } from '@/resources/models/championship';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AsyncValidatorFn, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';

export type GlobalFormGroup = FormGroup<{
  name: FormControl<string>;
  categories: FormControl<string[]>;
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

export type EventFormGroup = FormGroup<{
  track_id: FormControl<string>;
  name: FormControl<string>;
  month: FormControl<number>;
  week_end: FormControl<number>;
  mandatory: FormControl<boolean>;
  type: FormControl<'time' | 'laps'>;
  duration: FormControl<number>;
  start_time: FormControl<string>;
}>;

export type CarFormGroup = FormGroup<{
  team_name: FormControl<string>;
  category: FormControl<string>;
  model: FormControl<string>;
  livery: FormControl<string>;
  livery_id: FormControl<number>;
  model_folder: FormControl<string>;
}>;

@Injectable()
export class ChampionshipsFormManager {
  private readonly appDatabase = inject(AppDatabase);
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly eventRepository = inject(EventRepository);
  private readonly carRepository = inject(CarRepository);
  private readonly trackRepository = inject(TrackRepository);
  private readonly teamRepository = inject(TeamRepository);
  private readonly vehicleClassRepository = inject(VehicleClassRepository);

  readonly isSaving = signal(false);
  readonly tracks = toSignal(from(this.trackRepository.getAllTracks()), { initialValue: [] });
  readonly teams = toSignal(from(this.teamRepository.getAllTeams()), { initialValue: [] });
  readonly vehicleClasses = toSignal(from(this.vehicleClassRepository.getAllVehicleClasses()), {
    initialValue: [],
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

  readonly globalForm: GlobalFormGroup = this.createGlobalForm();
  readonly eventsForm = new FormArray<EventFormGroup>([]);
  readonly carsForm = new FormArray<CarFormGroup>([]);

  readonly globalFormValid = signal(this.globalForm.valid);
  readonly eventsFormValid = signal(this.eventsForm.valid);
  readonly carsFormValid = signal(this.carsForm.valid);

  readonly championshipName = computed(() => this.globalForm.controls.name.value || 'championship');

  private readonly loadedChampionshipId = signal<number | null>(null);
  private readonly originalChampionshipName = signal<string | null>(null);

  constructor() {
    this.globalForm.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
      this.globalFormValid.set(status === 'VALID');
    });
    this.eventsForm.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
      this.eventsFormValid.set(status === 'VALID');
    });
    this.carsForm.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
      this.carsFormValid.set(status === 'VALID');
    });
  }

  async syncWithInputs(id: number, resolvedChampionship?: Championship): Promise<boolean> {
    if (!Number.isFinite(id)) {
      if (this.loadedChampionshipId() !== null) {
        this.loadedChampionshipId.set(null);
        this.originalChampionshipName.set(null);
        this.resetForm();
      }
      return true;
    }

    if (this.loadedChampionshipId() === id) {
      return true;
    }

    this.loadedChampionshipId.set(id);
    return this.loadEditData(id, resolvedChampionship);
  }

  isStepValid(step: number): boolean {
    if (step === 0) {
      return this.globalForm.valid;
    }

    if (step === 1) {
      return this.eventsForm.valid;
    }

    return this.carsForm.valid;
  }

  markStepAsTouched(step: number): void {
    if (step === 0) {
      this.globalForm.markAllAsTouched();
      return;
    }

    if (step === 1) {
      this.eventsForm.markAllAsTouched();
      return;
    }

    this.carsForm.markAllAsTouched();
  }

  async save(id?: number): Promise<number> {
    this.globalForm.markAllAsTouched();

    if (!this.globalForm.valid) {
      throw new Error('Global step is invalid');
    }

    this.isSaving.set(true);

    try {
      const championship = this.buildChampionship(id);
      const events = this.buildEvents();
      const cars = this.buildCars();

      return await this.appDatabase.saveChampionshipWithRelations({
        championship,
        events,
        cars,
        id,
        previousName: this.originalChampionshipName() ?? undefined,
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  private async loadEditData(id: number, resolvedChampionship?: Championship): Promise<boolean> {
    const championship =
      resolvedChampionship ?? (await this.championshipRepository.getChampionshipById(id));

    if (!championship) {
      return false;
    }

    this.originalChampionshipName.set(championship.name);

    this.globalForm.patchValue({
      name: championship.name,
      tags: championship.tags,
      categories: championship.categories,
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

    this.replaceNumberArray(this.globalForm.controls.points, championship.points);

    const [events, cars] = await Promise.all([
      this.eventRepository.getEventsByChampionshipName(championship.name),
      this.carRepository.getCarsByChampionshipName(championship.name),
    ]);

    this.eventsForm.clear();
    this.carsForm.clear();

    for (const event of events) {
      this.eventsForm.push(
        this.createEventForm({
          track_id: event.track_id,
          name: event.name,
          month: event.month,
          week_end: event.week_end,
          mandatory: event.mandatory,
          type: event.type,
          duration: event.duration,
          start_time: event.start_time,
        }),
      );
    }

    for (const car of cars) {
      this.carsForm.push(
        this.createCarForm({
          team_name: car.team_name,
          category: car.category,
          model: car.model,
          livery: car.livery,
          livery_id: car.livery_id,
          model_folder: car.model_folder,
        }),
      );
    }

    return true;
  }

  private createGlobalForm(): GlobalFormGroup {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
        asyncValidators: [this.championshipNameAvailableValidator],
        updateOn: 'blur',
      }),
      categories: new FormControl<string[]>([], {
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

  private createEventForm(value?: {
    track_id?: string;
    name?: string;
    month?: number;
    week_end?: number;
    mandatory?: boolean;
    type?: 'time' | 'laps';
    duration?: number;
    start_time?: string;
  }): EventFormGroup {
    return new FormGroup({
      track_id: new FormControl(value?.track_id ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      name: new FormControl(value?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      month: new FormControl(value?.month ?? 1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      week_end: new FormControl(value?.week_end ?? 1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      mandatory: new FormControl(value?.mandatory ?? false, { nonNullable: true }),
      type: new FormControl(value?.type ?? 'time', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      duration: new FormControl(value?.duration ?? 20, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      start_time: new FormControl(value?.start_time ?? '', { nonNullable: true }),
    });
  }

  private createCarForm(value?: {
    team_name?: string;
    category?: string;
    model?: string;
    livery?: string;
    livery_id?: number;
    model_folder?: string;
  }): CarFormGroup {
    return new FormGroup({
      team_name: new FormControl(value?.team_name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      category: new FormControl(value?.category ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      model: new FormControl(value?.model ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      livery: new FormControl(value?.livery ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      livery_id: new FormControl(value?.livery_id ?? 0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      model_folder: new FormControl(value?.model_folder ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  private replaceNumberArray(target: FormArray<FormControl<number>>, values: number[]): void {
    target.clear();
    for (const value of values) {
      target.push(
        new FormControl(value, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(0)],
        }),
      );
    }

    if (target.length === 0) {
      target.push(new FormControl(0, { nonNullable: true }));
    }
  }

  private resetForm(): void {
    this.globalForm.reset(this.createGlobalForm().getRawValue());
    this.globalForm.controls.categories.setValue([]);
    this.globalForm.controls.tags.setValue([]);
    this.globalForm.controls.points.clear();
    this.globalForm.controls.points.push(new FormControl(25, { nonNullable: true }));
    this.eventsForm.clear();
    this.carsForm.clear();
  }

  private buildChampionship(id?: number): Championship {
    const rawValue = this.globalForm.getRawValue();

    return {
      id,
      name: rawValue.name.trim(),
      categories: rawValue.categories,
      prestige: rawValue.prestige,
      init_month: rawValue.init_month as Championship['init_month'],
      init_day: rawValue.init_day as Championship['init_day'],
      registration_start_month:
        rawValue.registration_start_month as Championship['registration_start_month'],
      registration_start_day:
        rawValue.registration_start_day as Championship['registration_start_day'],
      registration_end_month:
        rawValue.registration_end_month as Championship['registration_end_month'],
      registration_end_day: rawValue.registration_end_day as Championship['registration_end_day'],
      points: rawValue.points,
      pit_stop: rawValue.pit_stop,
      start_type: rawValue.start_type,
      field_type: null, // TODO calculate from cars
      events_count: rawValue.events_count,
      tags: rawValue.tags.map((value) => value.trim()).filter((value) => value.length > 0),
      start_year: rawValue.start_year,
      end_year: rawValue.end_year,
      default_included: rawValue.default_included,
    };
  }

  private buildEvents() {
    return this.eventsForm.controls.map((form) => ({
      track_id: form.controls.track_id.value,
      name: form.controls.name.value,
      month: form.controls.month.value as Championship['init_month'],
      week_end: form.controls.week_end.value as 1 | 2 | 3 | 4,
      mandatory: form.controls.mandatory.value,
      type: form.controls.type.value,
      duration: form.controls.duration.value,
      start_time: form.controls.start_time.value,
    }));
  }

  private buildCars() {
    return this.carsForm.controls.map((form) => ({
      team_name: form.controls.team_name.value,
      category: form.controls.category.value,
      model: form.controls.model.value,
      livery: form.controls.livery.value,
      livery_id: form.controls.livery_id.value,
      model_folder: form.controls.model_folder.value,
    }));
  }
}
