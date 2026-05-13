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

  protected readonly activeStep = signal(0);
  protected readonly isSaving = this.formService.isSaving;
  protected readonly tracks = this.formService.tracks;
  protected readonly teams = this.formService.teams;
  protected readonly vehicleClasses = this.formService.vehicleClasses;
  protected readonly globalForm = this.formService.globalForm;
  protected readonly eventsForm = this.formService.eventsForm;
  protected readonly carsForm = this.formService.carsForm;

  protected readonly isEditMode = computed(() => Number.isFinite(this.id()));
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? `Edit ${this.formService.championshipName()}` : 'Create championship',
  );

  protected readonly steps = [
    {
      id: 'global',
      label: 'Global',
      icon: '@tui.info',
      state: computed<StepState>(() => {
        if (this.activeStep() > 0) {
          return this.formService.globalFormValid() ? 'pass' : 'error';
        }
        return 'normal';
      }),
      disabled: signal(false),
    },
    {
      id: 'sep1',
      separator: true,
    },
    {
      id: 'events',
      label: 'Events',
      icon: '@tui.calendars',
      state: computed<StepState>(() => {
        if (this.activeStep() > 1) {
          return this.formService.eventsFormValid() ? 'pass' : 'error';
        }
        return 'normal';
      }),
      disabled: computed(() => !this.formService.globalFormValid()),
    },
    {
      id: 'sep2',
      separator: true,
    },
    {
      id: 'cars',
      label: 'Cars',
      icon: '@tui.car',
      state: computed<StepState>(() => {
        if (this.activeStep() > 2) {
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
    // TODO handle edit
    effect(() => {
      const id = this.id();
      const resolvedChampionship = this.championship();
      void this.formService.syncWithInputs(id, resolvedChampionship).then((exists) => {
        if (!exists) {
          void this.router.navigate(['/championships']);
        }
      });
    });
  }

  protected previousStep(): void {
    this.activeStep.update((value) => Math.max(value - 1, 0));
  }

  protected nextStep(): void {
    this.activeStep.update((value) => Math.min(value + 1, this.stepsCount - 1));
  }

  protected async save(): Promise<void> {
    // TODO handle final save
    if (!this.formService.isStepValid(0)) {
      this.formService.markStepAsTouched(0);
      this.activeStep.set(0);
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
    console.log('Events form value:', this.eventsForm.value);
    console.log('Cars form value:', this.carsForm.value);
  }
}
