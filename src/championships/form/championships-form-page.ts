import { Championship } from '@/resources/models/championship';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiStepper } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { ChampionshipCarsStep } from './cars-step/championship-cars-step';
import { ChampionshipsFormManager } from './championships-form-manager';
import { ChampionshipEventsStep } from './events-step/championship-events-step';
import { ChampionshipGlobalStep } from './global-step/championship-global-step';

type StepState = 'pass' | 'error' | 'normal';

@Component({
  selector: 'app-championships-form-page',
  templateUrl: './championships-form-page.html',
  styleUrl: './championships-form-page.css',
  imports: [
    ChampionshipCarsStep,
    ChampionshipEventsStep,
    ChampionshipGlobalStep,
    RouterLink,
    TuiButton,
    TuiHeader,
    TuiStepper,
    TuiTitle,
  ],
  providers: [ChampionshipsFormManager],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChampionshipsFormPage {
  private readonly formService = inject(ChampionshipsFormManager);
  private readonly router = inject(Router);
  private readonly notifications = inject(TuiNotificationService);

  readonly id = input(NaN, { transform: numberAttribute });
  readonly championship = input<Championship | undefined>(undefined);

  protected readonly activeStepIndex = signal(0);
  protected readonly nextStep = computed(
    () => this.steps.find((step) => step.id === this.activeStepIndex() + 1) ?? this.steps[2],
  );
  protected readonly isSaving = this.formService.isSaving;
  protected readonly tracks = this.formService.tracks;
  protected readonly teams = this.formService.teams;
  protected readonly vehicleClasses = this.formService.vehicleClasses;
  protected readonly globalForm = this.formService.globalForm;
  protected readonly championshipEvents = this.formService.championshipEvents;
  protected readonly championshipCars = this.formService.championshipCars;
  protected readonly championshipClasses = this.formService.championshipClasses;
  protected readonly liveriesForSelectedClasses = this.formService.liveriesForSelectedClasses;
  protected readonly minTracksGarages = this.formService.minTracksGarages;

  protected readonly isEditMode = computed(() => Number.isFinite(this.id()));
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? `Edit ${this.formService.championshipName()}` : 'Create championship',
  );

  protected readonly steps = [
    {
      id: 0,
      label: 'Global',
      icon: '@tui.info',
      state: computed<StepState>(() => {
        if (this.activeStepIndex() > 0) {
          return this.formService.globalFormValid() ? 'pass' : 'error';
        }
        return 'normal';
      }),
      disabled: signal(false),
    },
    {
      id: -1,
      separator: true,
    },
    {
      id: 1,
      label: 'Events',
      icon: '@tui.calendars',
      state: computed<StepState>(() => {
        if (this.activeStepIndex() > 1) {
          return this.formService.eventsFormValid() ? 'pass' : 'error';
        }
        return 'normal';
      }),
      // disabled: computed(() => !this.formService.globalFormValid()),
      disabled: signal(false), // TODO temp
    },
    {
      id: -2,
      separator: true,
    },
    {
      id: 2,
      label: 'Cars',
      icon: '@tui.car',
      state: computed<StepState>(() => {
        if (this.activeStepIndex() > 2) {
          return this.formService.carsFormValid() ? 'pass' : 'error';
        }
        return 'normal';
      }),
      disabled: computed(
        () => !this.formService.globalFormValid() || !this.formService.eventsFormValid(),
      ),
    },
  ];
  protected readonly stepsCount = this.steps.filter((step) => !step.separator).length;

  constructor() {
    // TODO handle edit correctly
    effect(async () => {
      const id = this.id();
      const resolvedChampionship = this.championship();
      untracked(() =>
        this.formService.syncWithInputs(id, resolvedChampionship).then((exists) => {
          if (!exists) {
            void this.router.navigate(['/championships']);
          }
        }),
      );
    });
  }

  protected goToPreviousStep(): void {
    this.activeStepIndex.update((value) => Math.max(value - 1, 0));
  }

  protected goToNextStep(): void {
    this.activeStepIndex.update((value) => Math.min(value + 1, this.stepsCount - 1));
  }

  protected async save(): Promise<void> {
    // TODO handle final save
    if (!this.formService.isStepValid(0)) {
      this.formService.markStepAsTouched(0);
      this.activeStepIndex.set(0);
      return;
    }

    try {
      const championshipId = await this.formService.save(this.isEditMode() ? this.id() : undefined);

      this.notifications
        .open(this.isEditMode() ? 'Championship updated' : 'Championship created', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();

      await this.router.navigate(['/championships/details', championshipId, 'global']);
    } catch (error) {
      console.error('Failed to save championship', error);
      this.notifications
        .open('Failed to save championship', {
          appearance: 'negative',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
    }
  }

  protected logValues(): void {
    console.log('Global form value:', this.globalForm.value);
    console.log('Events form value:', this.championshipEvents());
    console.log('Cars form value:', this.championshipCars());
  }
}
