import { COUNTRIES, Country } from '@/shared/constants/countries';
import { Driver } from '@/shared/models/driver';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDataList,
  tuiDateFormatProvider,
  TuiError,
  TuiFilterByInputOptions,
  TuiFilterByInputPipe,
  TuiIcon,
  TuiInput,
  TuiNotificationService,
  TuiScrollable,
  TuiScrollControls,
  TuiScrollRef,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInputDate,
  tuiInputDateOptionsProvider,
  TuiInputNumber,
  TuiInputSlider,
  TuiInputYear,
  TuiSelect,
  TuiTooltip,
} from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import { DriverFormManager } from './driver-form-manager';
import { TuiDay } from '@taiga-ui/cdk';
import { PercentInput } from '@/shared/components/percent-input/percent-input';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.css',
  imports: [
    OrdinalPipe,
    PercentInput,
    ReactiveFormsModule,
    RouterLink,
    ScrollingModule,
    TuiButton,
    TuiChevron,
    TuiComboBox,
    TuiDataList,
    TuiDataListWrapper,
    TuiError,
    TuiFilterByInputPipe,
    TuiForm,
    TuiHeader,
    TuiIcon,
    TuiInput,
    TuiInputDate,
    TuiInputNumber,
    TuiInputSlider,
    TuiInputYear,
    TuiSelect,
    TuiScrollControls,
    TuiScrollRef,
    TuiTitle,
    TuiTooltip,
  ],
  providers: [
    DriverFormManager,
    tuiInputDateOptionsProvider({
      valueTransformer: {
        fromControlValue: (value: string | null): TuiDay | null => {
          if (!value) {
            return null;
          }
          const [year, month, day] = value.split('-').map(Number);
          return new TuiDay(year, month - 1, day);
        },
        toControlValue: (day: TuiDay | null): string | null => {
          if (!day) {
            return null;
          }
          const year = day.year;
          const month = String(day.month + 1).padStart(2, '0');
          const date = String(day.day).padStart(2, '0');
          return `${year}-${month}-${date}`;
        },
      },
    }),
    tuiDateFormatProvider({ mode: 'yyyy/mm/dd', separator: '-' }),
  ],
})
export default class DriverForm {
  protected readonly formManager = inject(DriverFormManager);

  private readonly router = inject(Router);
  private readonly notifications = inject(TuiNotificationService);

  readonly driver = input<Driver | undefined>(undefined);

  readonly canDeactivate = signal(false);

  protected readonly driverName = computed(() =>
    `${this.driver()?.name ?? ''} ${this.driver()?.surname ?? ''}`.trim(),
  );
  protected readonly isEditMode = computed(() => this.driver() !== undefined);
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? `Edit ${this.driverName()}` : 'New driver',
  );

  protected readonly COUNTRIES = COUNTRIES;

  protected readonly filterCountryByInput: TuiFilterByInputOptions<Country>['filter'] = (
    items,
    query,
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.iso3.toString().toLowerCase().includes(normalizedQuery) ||
        item.iso2.toString().toLowerCase().includes(normalizedQuery),
    );
  };
  protected readonly stringifyCountry = (iso3: string) =>
    this.COUNTRIES.find((country) => country.iso3 === iso3)?.name ?? iso3;
  protected readonly countryItemHeight = 40;
  protected readonly countryItemCount = 10;

  protected readonly endYearTooltip = 'Last year where the contract will be active.';
  protected readonly expectedStandingTooltip = `The team expects the driver to finish in this position.
    Anything worse is a disappointment, anything better is a nice surprise.`;
  protected readonly teamLoyaltyTooltip =
    'How likely a driver is to accept a contract from a better team.';
  protected readonly eloTooltip = `Initial ELO rating of the driver.
    >1700 is class A, <1100 is class F.`;
  protected readonly skillsTooltip = `See <a href="https://forum.reizastudios.com/threads/information-for-customizing-ai-drivers-in-ams2.21758/" target="_blank">this forum thread</a> for the skills and what they do.`;

  constructor() {
    effect(() => this.formManager.loadDriver(this.driver()));
  }

  protected async save(): Promise<void> {
    if (!this.formManager.form.valid) {
      this.notifications.open('Invalid form', {
        appearance: 'negative',
        autoClose: 3000,
        closable: false,
      });
      return;
    }
    try {
      const driverId = await this.formManager.save();

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
}
