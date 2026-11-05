import { PercentInput } from '@/shared/components/percent-input/percent-input';
import { COUNTRIES, Country } from '@/shared/constants/countries';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { VehicleClassModPipe } from '@/shared/pipes/vehicle-class-mod/vehicle-class-mod-pipe';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDataList,
  tuiDateFormatProvider,
  TuiError,
  TuiFilterByInputOptions,
  TuiFilterByInputPipe,
  TuiIcon,
  TuiInput,
  TuiScrollControls,
  TuiScrollRef,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInputDate,
  TuiInputNumber,
  TuiInputSlider,
  TuiInputYear,
  TuiSelect,
  TuiTooltip,
} from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import { DriverFormManager } from './driver-form-manager';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.css',
  imports: [
    FormRoot,
    FormField,
    OrdinalPipe,
    PercentInput,
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
    VehicleClassModPipe,
    VehicleClassNamePipe,
  ],
  providers: [DriverFormManager, tuiDateFormatProvider({ mode: 'yyyy/mm/dd', separator: '-' })],
})
export default class DriverForm {
  protected readonly formManager = inject(DriverFormManager);
  private readonly vehicleClassUtils = inject(VehicleClassUtils);

  readonly id = input(NaN, { transform: numberAttribute });

  readonly canDeactivate = this.formManager.canDeactivate;

  protected readonly pageTitle = computed(() =>
    this.formManager.isEditMode() ? `Edit ${this.formManager.existingDriverName()}` : 'New driver',
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

  protected readonly stringifyCategory = (catId: string) =>
    this.vehicleClassUtils.getVehicleClassName(catId) ?? catId;

  protected readonly endYearTooltip = 'Last year where the contract will be active.';
  protected readonly expectedStandingTooltip = `The team expects the driver to finish in this position.
    Anything worse is a disappointment, anything better is a nice surprise.`;
  protected readonly teamLoyaltyTooltip =
    'How likely a driver is to accept a contract from a better team.';
  protected readonly eloTooltip = `Initial ELO rating of the driver.
    >1700 is class A, <1100 is class F.`;
  protected readonly skillsTooltip = `See <a href="https://forum.reizastudios.com/threads/information-for-customizing-ai-drivers-in-ams2.21758/" target="_blank">this forum thread</a> for the skills and what they do.`;

  constructor() {
    effect(() => this.formManager.existingDriverId.set(this.id()));
  }
}
