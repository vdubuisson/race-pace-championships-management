import { TeamRepository } from '@/db/team-repository';
import { PercentInput } from '@/shared/components/percent-input/percent-input';
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
import { TuiButton, TuiError, TuiInput, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
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
    PercentInput,
    RouterLink,
    TuiButton,
    TuiError,
    TuiForm,
    TuiHeader,
    TuiInput,
    TuiInputNumber,
    TuiTitle,
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
        ? this.teamToTeamModel(existingTeam)
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
      max(schemaPath.driver_loyalty, 100, { message: 'Driver loyalty must be at most 100' });

      min(schemaPath.expectation_level, 0, { message: 'Expectation level must be at least 0' });
      max(schemaPath.expectation_level, 100, { message: 'Expectation level must be at most 100' });

      min(schemaPath.performance_rating, 0, { message: 'Performance rating must be at least 0' });
      max(schemaPath.performance_rating, 100, {
        message: 'Performance rating must be at most 100',
      });

      min(schemaPath.engineering_weight, 0, { message: 'Engineering weight must be at least 0' });
      max(schemaPath.engineering_weight, 100, {
        message: 'Engineering weight must be at most 100',
      });

      min(schemaPath.engineering_drag, 0, { message: 'Engineering drag must be at least 0' });
      max(schemaPath.engineering_drag, 100, { message: 'Engineering drag must be at most 100' });

      min(schemaPath.engineering_power, 0, { message: 'Engineering power must be at least 0' });
      max(schemaPath.engineering_power, 100, { message: 'Engineering power must be at most 100' });
    },
    {
      submission: {
        action: (fieldTree) => this.onSubmit(fieldTree),
      },
    },
  );

  protected readonly loyaltyTooltip = `How much a team will favour drivers they are happy with VS better ranked drivers that are on the market.
    Between 0 and 100, defaults to a random value between 0 and 20.`;
  protected readonly expectationLevelTooltip = `Happiness of driver/team relationships is determined by how well a driver does compared to what can be theoretically expected of them based on their past results.
    This is a value between 0 and 100, where 0 means very low expectations, and 100 means very high expectations.`;
  protected readonly performanceRatingTooltip = `Between 0 and 100, defines how much budget the team has for performance and what the expected results from their sponsors.`;
  protected readonly engineeringTooltip = `Between 0 and 100. The 3 engineering values define the balance in which the performance budget is allocated.`;

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
      const teamToSave = this.teamModelToTeam(form().value());
      if (!isNaN(this.id())) {
        await this.teamsService.updateTeam(this.id(), this.originalName()!, teamToSave);
        this.notifications
          .open('Team updated successfully', {
            appearance: 'positive',
            autoClose: 3000,
            closable: false,
          })
          .subscribe();
      } else {
        await this.teamRepository.addTeam(teamToSave);
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

  private teamToTeamModel(team: Team): TeamModel {
    return {
      id: undefined,
      name: team.name,
      principal: team.principal ?? '',
      driver_loyalty: team.driver_loyalty !== null ? team.driver_loyalty * 100 : null,
      expectation_level: team.expectation_level !== null ? team.expectation_level * 100 : null,
      performance_rating: team.performance_rating !== null ? team.performance_rating * 100 : null,
      engineering_weight: team.engineering_weight !== null ? team.engineering_weight * 100 : null,
      engineering_drag: team.engineering_drag !== null ? team.engineering_drag * 100 : null,
      engineering_power: team.engineering_power !== null ? team.engineering_power * 100 : null,
    };
  }

  private teamModelToTeam(model: TeamModel): Team {
    return {
      name: model.name,
      principal: model.principal || null,
      driver_loyalty: model.driver_loyalty !== null ? model.driver_loyalty / 100 : null,
      expectation_level: model.expectation_level !== null ? model.expectation_level / 100 : null,
      performance_rating: model.performance_rating !== null ? model.performance_rating / 100 : null,
      engineering_weight: model.engineering_weight !== null ? model.engineering_weight / 100 : null,
      engineering_drag: model.engineering_drag !== null ? model.engineering_drag / 100 : null,
      engineering_power: model.engineering_power !== null ? model.engineering_power / 100 : null,
    };
  }
}
