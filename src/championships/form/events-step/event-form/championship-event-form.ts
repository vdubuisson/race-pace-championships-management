import { RaceEvent, RaceEventType } from '@/shared/models/race-event';
import { Track } from '@/shared/models/track';
import { CountryCodePipe } from '@/shared/pipes/country-code/country-code-pipe';
import { DurationPipe } from '@/shared/pipes/duration/duration-pipe';
import { MonthPipe } from '@/shared/pipes/month/month-pipe';
import { OrdinalPipe } from '@/shared/pipes/ordinal/ordinal-pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiTime } from '@taiga-ui/cdk/date-time';
import {
  TuiButton,
  TuiCell,
  TuiDataList,
  TuiError,
  TuiFilterByInputOptions,
  TuiFilterByInputPipe,
  TuiInput,
  TuiLabel,
  TuiPopup,
  TuiScrollable,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiChip,
  TuiComboBox,
  TuiDataListWrapper,
  TuiDrawer,
  TuiFlagPipe,
  TuiInputNumber,
  TuiInputTime,
  tuiInputTimeOptionsProvider,
  TuiSelect,
  TuiSwitch,
} from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-championship-event-form',
  templateUrl: './championship-event-form.html',
  styleUrl: './championship-event-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MonthPipe,
    OrdinalPipe,
    tuiInputTimeOptionsProvider({
      valueTransformer: {
        fromControlValue(controlValue: string | null): TuiTime | null {
          return controlValue ? TuiTime.fromString(controlValue) : null;
        },
        toControlValue(time: TuiTime | null): string | null {
          return time ? time.toString() : null;
        },
      },
    }),
  ],
  imports: [
    CountryCodePipe,
    DurationPipe,
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
    TuiFlagPipe,
    TuiForm,
    TuiHeader,
    TuiInput,
    TuiInputNumber,
    TuiInputTime,
    TuiLabel,
    TuiPopup,
    TuiScrollable,
    TuiSelect,
    TuiSwitch,
    TuiTextfield,
    TuiTitle,
  ],
})
export class ChampionshipEventForm {
  private readonly monthPipe = inject(MonthPipe);
  private readonly ordinalPipe = inject(OrdinalPipe);

  readonly isShown = input.required<boolean>();
  readonly tracks = input.required<Track[]>();
  readonly editedEvent = input<RaceEvent | null>(null);

  readonly formCancel = output<void>();
  readonly formSubmit = output<RaceEvent>();

  protected readonly trackItemHeight = 84;
  protected readonly trackItemCount = 5;

  protected readonly eventForm = new FormGroup({
    track: new FormControl<Track | null>(null, {
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    month: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(12)],
    }),
    week_end: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(4)],
    }),
    mandatory: new FormControl(false, { nonNullable: true }),
    type: new FormControl<RaceEventType>('time', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    duration: new FormControl(20, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    start_time: new FormControl<string | null>(null),
    no_modded_tracks: new FormControl(false, { nonNullable: true }),
  });

  protected readonly countries = computed(() => {
    const countriesSet = new Set(this.tracks().map((track) => track.country));
    return Array.from(countriesSet).toSorted((a, b) => a.localeCompare(b));
  });
  protected readonly selectedCountries = signal<string[]>([]);

  protected readonly types = computed(() => {
    const typesSet = new Set(this.tracks().map((track) => track.type));
    return Array.from(typesSet).toSorted((a, b) => a.localeCompare(b));
  });
  protected readonly selectedTypes = signal<string[]>([]);

  protected readonly noModdedTracksFilter = signal(false);

  protected readonly filteredTracks = computed(() =>
    this.tracks()
      .filter((track) => {
        return (
          (this.selectedCountries().length === 0 ||
            this.selectedCountries().includes(track.country)) &&
          (this.selectedTypes().length === 0 || this.selectedTypes().includes(track.type)) &&
          (!this.noModdedTracksFilter() || !track.is_mod)
        );
      })
      .toSorted((a, b) => {
        const locationCompare = a.location.localeCompare(b.location);
        return locationCompare !== 0 ? locationCompare : a.start_year - b.start_year;
      }),
  );

  protected readonly getTrackName = (track: Track | null): string => track?.name ?? 'Unknown track';
  protected readonly getMonthName = (month: number): string => this.monthPipe.transform(month);
  protected readonly getOrdinal = (value: number): string => this.ordinalPipe.transform(value);

  protected readonly filterTrackByInput: TuiFilterByInputOptions<Track>['filter'] = (
    items,
    query,
  ) => {
    const normalizeString = (str: string): string =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedQuery = normalizeString(query.trim().toLowerCase());
    return items.filter(
      (item) =>
        normalizeString(item.name.toLowerCase()).includes(normalizedQuery) ||
        normalizeString(item.real_name.toLowerCase()).includes(normalizedQuery),
    );
  };

  constructor() {
    effect(() => {
      const editedEvent = this.editedEvent();
      if (editedEvent) {
        this.eventForm.patchValue({
          track: this.tracks().find((track) => track.id === editedEvent.track_id) ?? null,
          ...editedEvent,
        });
      } else {
        this.eventForm.reset();
      }
    });
  }

  protected toggleChipFilter(filters: WritableSignal<string[]>, value: string): void {
    filters.update((filters) =>
      filters.includes(value) ? filters.filter((c) => c !== value) : [...filters, value],
    );
  }

  cancelForm(): void {
    this.formCancel.emit();
    this.eventForm.reset();
  }

  submitForm(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      this.formSubmit.emit({
        ...(this.editedEvent() ?? {}),
        track_id: formValue.track!.id,
        name: formValue.name,
        month: formValue.month,
        week_end: formValue.week_end,
        mandatory: formValue.mandatory,
        type: formValue.type,
        duration: formValue.duration,
        start_time: formValue.start_time ?? null,
      } as RaceEvent);
      this.eventForm.reset();
    } else {
      this.eventForm.markAllAsTouched();
    }
  }
}
