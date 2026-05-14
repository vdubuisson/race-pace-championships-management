import { VehicleClass } from '@/resources/models/vehicle-class';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiButton,
  TuiCell,
  TuiDataList,
  TuiError,
  TuiFilterByInputPipe,
  TuiGroup,
  TuiIcon,
  TuiInput,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiDataListWrapper,
  TuiInputChip,
  TuiInputNumber,
  TuiInputYear,
  TuiMultiSelect,
  TuiSelect,
  TuiSwitch,
  TuiTooltip,
} from '@taiga-ui/kit';
import { TuiForm } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';
import { GlobalFormGroup } from '../championships-form-manager';

@Component({
  selector: 'app-championship-global-step',
  templateUrl: './championship-global-step.html',
  styleUrl: './championship-global-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MonthPipe, TitleCasePipe],
  imports: [
    OrdinalPipe,
    ReactiveFormsModule,
    TuiButton,
    TuiCell,
    TuiChevron,
    TuiDataList,
    TuiDataListWrapper,
    TuiError,
    TuiFilterByInputPipe,
    TuiForm,
    TuiGroup,
    TuiIcon,
    TuiInput,
    TuiInputChip,
    TuiInputNumber,
    TuiInputYear,
    TuiMultiSelect,
    TuiSelect,
    TuiSwitch,
    TuiTitle,
    TuiTooltip,
  ],
})
export class ChampionshipGlobalStep {
  private readonly monthPipe = inject(MonthPipe);
  private readonly titleCasePipe = inject(TitleCasePipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = input.required<GlobalFormGroup>();
  readonly vehicleClasses = input.required<VehicleClass[]>();

  protected readonly months: { id: number; name: string }[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ].map((id) => ({ id, name: this.monthPipe.transform(id) }));

  protected getCategoryName = (vehicleClass: VehicleClass | string): string => {
    if (typeof vehicleClass === 'string') {
      const category = this.vehicleClasses().find((cat) => cat.id === vehicleClass);
      return category ? (category.name ?? category.id) : vehicleClass;
    } else {
      return vehicleClass.name ?? vehicleClass.id;
    }
  };

  protected getMonthName = (month: number): string => this.monthPipe.transform(month);
  protected getTitleCase = (text: string): string => this.titleCasePipe.transform(text);

  protected initTooltip = `When the new season of the championship is announced.
    Suggest keeping it always the same.`;
  protected registrationStartTooltip = `Recruitment starts on this date.
    Note that AI drivers that don't have a contract will not wait for better offers – they consider all the offers they receive on a certain day and make a decision then.
    As a result, it's recommended keeping the registration start day the same for all championships.`;
  protected registrationEndTooltip = `Registrations close at this date.
    Teams will find drivers for any remaining open seats.
    Offers to the player expire on this date.`;
  protected prestigeTooltip = `Drivers will generally prefer championships with more prestige.
    You will receive contract offers based on the prestige and your current score.`;
  protected eventsCountTooltip = `How many events will take place in one season of this championship.`;

  protected endYearMin = signal(0);
  protected startYearMax = signal(9999);

  private startYearChangesSubscription?: Subscription;
  private endYearChangesSubscription?: Subscription;

  constructor() {
    effect(() => {
      if (this.form()) {
        this.startYearChangesSubscription?.unsubscribe();
        this.endYearChangesSubscription?.unsubscribe();

        this.startYearChangesSubscription = this.form()
          .controls.start_year.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((startYear) => {
            this.endYearMin.set(startYear ?? 0);
          });

        this.endYearChangesSubscription = this.form()
          .controls.end_year.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((endYear) => {
            this.startYearMax.set(endYear ?? 9999);
          });
      }
    });
  }

  protected get pointsForms(): FormArray<FormControl<number>> {
    return this.form().controls.points;
  }

  protected addPoint(): void {
    this.pointsForms.push(
      new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
    );
  }

  protected removePoint(index: number): void {
    if (this.pointsForms.length <= 1) {
      return;
    }

    this.pointsForms.removeAt(index);
  }
}
