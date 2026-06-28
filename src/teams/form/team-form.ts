import { TeamRepository } from '@/db/team-repository';
import { Team } from '@/shared/models/team';
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
import {
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiError,
  TuiIcon,
  TuiInput,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiInputNumber, TuiTooltip } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.html',
  styleUrl: './team-form.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiError,
    TuiForm,
    TuiHeader,
    TuiIcon,
    TuiInput,
    TuiInputNumber,
    TuiTitle,
    TuiTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TeamForm {
  private readonly teamRepository = inject(TeamRepository);
  private readonly router = inject(Router);
  private readonly notifications = inject(TuiNotificationService);

  readonly id = input(NaN, { transform: numberAttribute });

  readonly canDeactivate = signal(false);

  private readonly originalName = signal<string | null>(null);

  readonly pageTitle = computed(() =>
    this.originalName() ? `Edit Team: ${this.originalName()}` : 'New Team',
  );

  private readonly teamNameAvailableValidator: AsyncValidatorFn = async (control) => {
    const name = control.value?.trim();

    if (!name) {
      return null;
    }

    const existingTeam = await this.teamRepository.getTeamByName(name);

    if (!existingTeam) {
      return null;
    }

    const currentTeamId = this.id();

    if (!isNaN(currentTeamId) && existingTeam.id === currentTeamId) {
      return null;
    }

    return { teamNameTaken: 'This team name is already taken' };
  };

  protected readonly teamForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
      asyncValidators: [this.teamNameAvailableValidator],
      updateOn: 'blur',
    }),
    principal: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    driver_loyalty: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    expectation_level: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    performance_rating: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    engineering_weight: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    engineering_drag: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    engineering_power: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
  });

  protected readonly loyaltyTooltip = `How much a team will favour drivers they are happy with VS better ranked drivers that are on the market.
    Between 0 and 1, defaults to a random value between 0 and 0.2.`;
  protected readonly expectationLevelTooltip = `Happiness of driver/team relationships is determined by how well a driver does compared to what can be theoretically expected of them based on their past results.
    This is a value between 0 and 1, where 0 means very low expectations, and 1 means very high expectations.`;
  protected readonly performanceRatingTooltip = `Between 0 and 1, defines how much budget the team has for performance and what the expected results from their sponsors.`;
  protected readonly engineeringTooltip = `Between 0 and 1. The 3 engineering values define the balance in which the performance budget is allocated.`;

  constructor() {
    effect(() => {
      if (!isNaN(this.id())) {
        this.teamRepository.getTeamById(this.id()).then((team) => {
          if (team) {
            this.originalName.set(team.name);
            this.teamForm.patchValue(team);
          } else {
            console.error('Team not found with id', this.id());
            this.router.navigate(['/teams']);
          }
        });
      }
    });
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    if (this.teamForm.valid) {
      try {
        if (!isNaN(this.id())) {
          await this.teamRepository.updateTeam(this.id() as number, this.teamForm.value as Team);
          this.notifications
            .open('Team updated successfully', {
              appearance: 'positive',
              autoClose: 3000,
              closable: false,
            })
            .subscribe();
        } else {
          await this.teamRepository.addTeam(this.teamForm.value as Team);
          this.notifications
            .open('Team added successfully', {
              appearance: 'positive',
              autoClose: 3000,
              closable: false,
            })
            .subscribe();
        }
        this.canDeactivate.set(true);
        this.router.navigate(['/teams']);
      } catch (error) {
        console.error('A team already exists with the same name');
      }
    } else {
      console.error('Form is invalid');
    }
  }
}
