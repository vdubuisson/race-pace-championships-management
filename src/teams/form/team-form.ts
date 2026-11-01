import { TeamRepository } from '@/db/team-repository';
import { Team } from '@/shared/models/team';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  resource,
  Signal,
  signal,
} from '@angular/core';
import {
  debounce,
  disabled,
  FieldTree,
  form,
  FormField,
  FormRoot,
  max,
  min,
  required,
  validateAsync,
} from '@angular/forms/signals';
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
import { TeamsService } from '../teams-service/teams-service';
import { TeamNameValidator } from './team-name-validator';

type TeamModel = Team & {
  principal: string;
};

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.html',
  styleUrl: './team-form.css',
  imports: [
    FormField,
    FormRoot,
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
  providers: [TeamNameValidator],
})
export default class TeamForm {
  private readonly teamRepository = inject(TeamRepository);
  private readonly teamsService = inject(TeamsService);
  private readonly teamNameValidator = inject(TeamNameValidator);
  private readonly router = inject(Router);
  private readonly notifications = inject(TuiNotificationService);

  readonly id = input(NaN, { transform: numberAttribute });

  private readonly existingTeam = resource({
    params: () => this.id(),
    loader: async ({ params: id }) => {
      if (!isNaN(id)) {
        return this.teamRepository.getTeamById(id);
      }
      return null;
    },
    defaultValue: null,
  });

  readonly canDeactivate = signal(false);

  private readonly originalName = computed(() => this.existingTeam.value()?.name);

  readonly pageTitle = computed(() =>
    this.originalName() ? `Edit Team: ${this.originalName()}` : 'New Team',
  );

  private checkTeamNameAvailable = (teamNameSignal: Signal<string | undefined>) =>
    resource({
      params: () => teamNameSignal(),
      loader: async ({ params: teamName }) =>
        this.teamNameValidator.isAvailable(teamName, this.id()),
    });

  private readonly teamModel = linkedSignal<Team | null | undefined, TeamModel>({
    source: this.existingTeam.value,
    computation: (existingTeam) =>
      existingTeam
        ? { ...existingTeam, id: undefined, principal: existingTeam.principal ?? '' }
        : {
            name: '',
            principal: '',
            driver_loyalty: null,
            expectation_level: null,
            performance_rating: null,
            engineering_weight: null,
            engineering_drag: null,
            engineering_power: null,
          },
  });

  protected readonly teamForm = form(
    this.teamModel,
    (schemaPath) => {
      disabled(schemaPath, { when: () => this.existingTeam.isLoading() });

      debounce(schemaPath.name, 'blur');
      required(schemaPath.name, { message: 'Team name is required' });
      validateAsync(schemaPath.name, {
        params: ({ value }) => {
          const teamName = value().trim();
          return !teamName ? undefined! : teamName;
        },
        factory: this.checkTeamNameAvailable,
        onSuccess: (isAvailable) =>
          isAvailable ? null : { kind: 'teamNameTaken', message: 'Team name is already taken' },
        onError: () => ({
          kind: 'teamNameCheckFailed',
          message: 'Failed to check team name availability',
        }),
      });

      min(schemaPath.driver_loyalty, 0, { message: 'Driver loyalty must be at least 0' });
      max(schemaPath.driver_loyalty, 1, { message: 'Driver loyalty must be at most 1' });

      min(schemaPath.expectation_level, 0, { message: 'Expectation level must be at least 0' });
      max(schemaPath.expectation_level, 1, { message: 'Expectation level must be at most 1' });

      min(schemaPath.performance_rating, 0, { message: 'Performance rating must be at least 0' });
      max(schemaPath.performance_rating, 1, { message: 'Performance rating must be at most 1' });

      min(schemaPath.engineering_weight, 0, { message: 'Engineering weight must be at least 0' });
      max(schemaPath.engineering_weight, 1, { message: 'Engineering weight must be at most 1' });

      min(schemaPath.engineering_drag, 0, { message: 'Engineering drag must be at least 0' });
      max(schemaPath.engineering_drag, 1, { message: 'Engineering drag must be at most 1' });

      min(schemaPath.engineering_power, 0, { message: 'Engineering power must be at least 0' });
      max(schemaPath.engineering_power, 1, { message: 'Engineering power must be at most 1' });
    },
    {
      submission: {
        action: (fieldTree) => this.onSubmit(fieldTree),
      },
    },
  );

  protected readonly loyaltyTooltip = `How much a team will favour drivers they are happy with VS better ranked drivers that are on the market.
    Between 0 and 1, defaults to a random value between 0 and 0.2.`;
  protected readonly expectationLevelTooltip = `Happiness of driver/team relationships is determined by how well a driver does compared to what can be theoretically expected of them based on their past results.
    This is a value between 0 and 1, where 0 means very low expectations, and 1 means very high expectations.`;
  protected readonly performanceRatingTooltip = `Between 0 and 1, defines how much budget the team has for performance and what the expected results from their sponsors.`;
  protected readonly engineeringTooltip = `Between 0 and 1. The 3 engineering values define the balance in which the performance budget is allocated.`;

  constructor() {
    effect(() => {
      if (!this.existingTeam.isLoading() && this.existingTeam.value() === undefined) {
        console.error('Team not found with id', this.id());
        this.canDeactivate.set(true);
        this.router.navigate(['/teams']);
      }
    });
  }

  protected async onSubmit(form: FieldTree<TeamModel>): Promise<void> {
    try {
      if (!isNaN(this.id())) {
        await this.teamsService.updateTeam(this.id(), this.originalName()!, form().value());
        this.notifications
          .open('Team updated successfully', {
            appearance: 'positive',
            autoClose: 3000,
            closable: false,
          })
          .subscribe();
      } else {
        await this.teamRepository.addTeam(form().value());
        this.notifications
          .open('Team added successfully', {
            appearance: 'positive',
            autoClose: 3000,
            closable: false,
          })
          .subscribe();
      }
      this.canDeactivate.set(true);
      await this.router.navigate(['/teams']);
    } catch (error) {
      console.error('A team already exists with the same name');
    }
  }
}
