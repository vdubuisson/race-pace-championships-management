import { ChangeDetectionStrategy, Component, effect, inject, input, numberAttribute } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiIcon, TuiInput, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiInputNumber, TuiTooltip } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import { TeamRepository } from '../../db/team-repository';
import { Team } from '../../resources/models/team';

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
  protected readonly notifications = inject(TuiNotificationService)

  readonly id = input(NaN, {transform: numberAttribute});

  private readonly teamNameAvailableValidator: AsyncValidatorFn = async control => {
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
    elo: new FormControl<number>(1500, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    principal: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    driver_loyalty: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(1)],
    }),
    expectation_delta: new FormControl<number | null>(null),
  });

  protected readonly eloTooltip = `Initial ELO/ranking of the team.
    Affects their chances of hiring better driver.
    These numbers will get balanced out in the initial simulation anyway.`;
  protected readonly loyaltyTooltip = `How much a team will favour drivers they are happy with VS better ranked drivers that are on the market.
    Between 0 and 1, defaults to a random value between 0 and 0.2.`;
  protected readonly expectationDeltaTooltip = `Happiness of driver/team relationships is determined by how well a driver does compared to what can be theoretically expected of them based on their past results.
    This value is a number of ELO points that shifts the team's expectation up or down for their drivers, making them more or less demanding.
    Defaults to a value between 10 and 70. Negative values are supported but make teams very forgiving.`;

  constructor() {
    effect(() => {
      if (!isNaN(this.id())) {
        this.teamRepository.getTeamById(this.id()).then(team => {
          if (team) {
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
          this.notifications.open('Team updated successfully', { appearance: 'positive', autoClose: 3000, closable: false }).subscribe();
        } else {
          await this.teamRepository.addTeam(this.teamForm.value as Team);
          this.notifications.open('Team added successfully', { appearance: 'positive', autoClose: 3000, closable: false }).subscribe();
        }
        this.router.navigate(['/teams']);
      } catch (error) {
        console.error('A team already exists with the same name');
      }
    } else {
      console.log('Form is invalid');
    }
  }

  protected setRandomElo() {
    this.teamForm.patchValue({ elo: Math.floor(Math.random() * 800) + 1300 });
  }
}
