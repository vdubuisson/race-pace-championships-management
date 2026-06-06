import { Car } from '@/shared/models/car';
import { Livery } from '@/shared/models/livery';
import { Team } from '@/shared/models/team';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiButton,
  TuiCell,
  TuiDataList,
  TuiError,
  TuiFilterByInputOptions,
  TuiFilterByInputPipe,
  TuiPopup,
  TuiScrollable,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiDataListWrapper,
  TuiDrawer,
  TuiSwitch,
} from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';

type TeamWithCarsCount = Team & { cars: number };

@Component({
  selector: 'app-championship-car-form',
  templateUrl: './championship-car-form.html',
  styleUrl: './championship-car-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ScrollingModule,
    TuiButton,
    TuiCell,
    TuiChevron,
    TuiChip,
    TuiComboBox,
    TuiDataList,
    TuiDataListWrapper,
    TuiDrawer,
    TuiError,
    TuiFilterByInputPipe,
    TuiForm,
    TuiHeader,
    TuiPopup,
    TuiScrollable,
    TuiSwitch,
    TuiTitle,
  ],
})
export class ChampionshipCarForm {
  readonly teams = input.required<Team[]>();
  readonly cars = input.required<Partial<Car>[]>();
  readonly liveries = input.required<Livery[]>();

  readonly isShown = input.required<boolean>();
  readonly editedCar = input<Partial<Car> | null>(null);
  readonly editedCategory = input<string | null>(null);

  readonly formCancel = output<void>();
  readonly formSubmit = output<Partial<Car>>();

  protected readonly noModdedCarsFilter = signal(false);

  protected readonly teamsWithCarsCount = computed<TeamWithCarsCount[]>(() => {
    return this.teams()
      .map((team) => ({
        ...team,
        cars: this.cars().filter((car) => car.team_name === team.name).length,
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly availableLiveries = computed<Livery[]>(() =>
    this.liveries()
      .filter((livery) => this.cars().every((car) => car.livery !== livery.livery_name))
      .toSorted(
        (a, b) =>
          a.car_name.localeCompare(b.car_name) || a.livery_name.localeCompare(b.livery_name),
      ),
  );

  protected readonly filteredAvailableLiveries = computed<Livery[]>(() =>
    this.noModdedCarsFilter()
      ? this.availableLiveries().filter((livery) => !livery.is_mod)
      : this.availableLiveries(),
  );

  protected readonly teamItemHeight = 56;
  protected readonly teamItemCount = 7;
  protected readonly liveryItemHeight = 84;
  protected readonly liveryItemCount = 6;

  protected readonly carForm = new FormGroup({
    livery: new FormControl<Livery | null>(null, {
      validators: [Validators.required],
    }),
    team_name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    no_modded_cars: new FormControl(false, { nonNullable: true }),
  });

  protected readonly getLiveryName = (livery: Livery | null): string =>
    livery?.livery_name ?? 'Unknown livery';

  protected readonly filterTeamByInput: TuiFilterByInputOptions<TeamWithCarsCount>['filter'] = (
    items,
    query,
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.cars.toString().toLowerCase().includes(normalizedQuery),
    );
  };

  protected readonly filterLiveryByInput: TuiFilterByInputOptions<Livery>['filter'] = (
    items,
    query,
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.livery_name.toLowerCase().includes(normalizedQuery) ||
        item.car_name.toLowerCase().includes(normalizedQuery),
    );
  };

  constructor() {
    effect(() => {
      const editedCar = this.editedCar();
      if (editedCar) {
        this.carForm.patchValue({
          livery: this.liveries().find((livery) => livery.livery_name === editedCar.livery) ?? null,
          team_name: editedCar.team_name,
        });
      } else {
        this.carForm.reset();
      }
    });
  }

  cancelForm(): void {
    this.formCancel.emit();
    this.carForm.reset();
  }

  submitForm(): void {
    if (this.carForm.valid) {
      const formValue = this.carForm.value;
      this.formSubmit.emit({
        ...(this.editedCar() ?? {}),
        category: formValue.livery!.class,
        model: formValue.livery!.car_name,
        livery: formValue.livery!.livery_name,
        livery_id: formValue.livery!.livery_id,
        team_name: formValue.team_name,
      });
      this.carForm.reset();
    } else {
      this.carForm.markAllAsTouched();
    }
  }
}
