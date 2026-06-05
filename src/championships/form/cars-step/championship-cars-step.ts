import { CarCard } from '@/championships/car-card/car-card';
import { Car } from '@/shared/models/car';
import { Livery } from '@/shared/models/livery';
import { Team } from '@/shared/models/team';
import { VehicleClass } from '@/shared/models/vehicle-class';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { TuiButton, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import { ChampionshipCarForm } from './car-form/championship-car-form';

@Component({
  selector: 'app-championship-cars-step',
  templateUrl: './championship-cars-step.html',
  styleUrl: './championship-cars-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CarCard, ChampionshipCarForm, TuiButton, TuiHeader, TuiTitle],
})
export class ChampionshipCarsStep {
  private readonly notifications = inject(TuiNotificationService);

  readonly cars = model<Partial<Car>[]>([]);
  readonly teams = input.required<Team[]>();
  readonly championshipClasses = input.required<VehicleClass[]>();
  readonly liveriesForSelectedClasses = input.required<Livery[]>();
  readonly maxCars = input.required<number>();

  readonly carsByCategory = computed<Map<string, Partial<Car>[]>>(() => {
    const map = new Map<string, Partial<Car>[]>();
    for (const car of this.cars()) {
      const category = car.category!;
      if (!map.has(category)) {
        map.set(category, [car]);
      } else {
        map.get(category)!.push(car);
      }
    }
    map.forEach((cars) => {
      cars.sort(
        (a, b) =>
          a.model!.localeCompare(b.model!) ||
          (a.team_name ?? '').localeCompare(b.team_name ?? '') ||
          a.livery!.localeCompare(b.livery!),
      );
    });
    return map;
  });

  readonly liveriesByCategory = computed<Map<string, Livery[]>>(() => {
    const map = new Map<string, Livery[]>();
    for (const livery of this.liveriesForSelectedClasses()) {
      const category = livery.class;
      if (!map.has(category)) {
        map.set(category, [livery]);
      } else {
        map.get(category)!.push(livery);
      }
    }
    return map;
  });

  protected readonly isFormShown = signal(false);
  protected readonly editedCar = signal<Partial<Car> | null>(null);
  protected readonly editedCategory = signal<string | null>(null);

  protected hideForm(): void {
    this.isFormShown.set(false);
    this.editedCar.set(null);
  }

  protected openNewForm(category: string): void {
    this.editedCar.set(null);
    this.editedCategory.set(category);
    this.isFormShown.set(true);
  }

  protected submitForm(formCar: Partial<Car>): void {
    if (formCar.id) {
      this.cars.update((cars) => cars.map((car) => (car.id === formCar.id ? formCar : car)));
      this.notifications
        .open('Car updated', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
    } else {
      const tempId = -this.cars().length - 1;
      this.cars.update((cars) => [...cars, { ...formCar, id: tempId }]);
      this.notifications
        .open('Car added', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
    }
    this.hideForm();
  }

  protected deleteCar(carToDelete: Partial<Car>): void {
    this.cars.update((cars) => cars.filter((car) => car.id !== carToDelete.id));
    this.notifications
      .open('Car deleted', {
        appearance: 'positive',
        autoClose: 3000,
        closable: false,
      })
      .subscribe();
  }

  protected openCarEdition(car: Partial<Car>): void {
    this.editedCategory.set(car.category ?? null);
    this.editedCar.set(car);
    this.isFormShown.set(true);
  }
}
