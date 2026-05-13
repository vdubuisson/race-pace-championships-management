import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiTitle } from '@taiga-ui/core';
import { TuiDrawer, TuiInputNumber } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Team } from '@/resources/models/team';

type CarFormGroup = FormGroup<{
  team_name: FormControl<string>;
  category: FormControl<string>;
  model: FormControl<string>;
  livery: FormControl<string>;
  livery_id: FormControl<number>;
  model_folder: FormControl<string>;
}>;

@Component({
  selector: 'app-championship-cars-step',
  templateUrl: './championship-cars-step.html',
  styleUrl: './championship-cars-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TuiButton,
    TuiCardLarge,
    TuiDrawer,
    TuiHeader,
    TuiInput,
    TuiInputNumber,
    TuiTitle,
  ],
})
export class ChampionshipCarsStep {
  readonly formArray = input.required<FormArray<CarFormGroup>>();
  readonly teams = input.required<Team[]>();

  protected readonly editingIndex = signal<number | 'new' | null>(null);
  protected readonly draftForm = signal<CarFormGroup>(this.createForm());

  protected readonly isDrawerOpen = computed(() => this.editingIndex() !== null);

  protected openNew(): void {
    this.draftForm.set(this.createForm());
    this.editingIndex.set('new');
  }

  protected openEdit(index: number): void {
    const source = this.formArray().at(index);
    this.draftForm.set(this.createForm(source.getRawValue()));
    this.editingIndex.set(index);
  }

  protected closeDrawer(): void {
    this.editingIndex.set(null);
    this.draftForm.set(this.createForm());
  }

  protected confirmDrawer(): void {
    const form = this.draftForm();
    form.markAllAsTouched();

    if (!form.valid) {
      return;
    }

    const value = form.getRawValue();
    const nextGroup = this.createForm(value);
    const targetIndex = this.editingIndex();

    if (targetIndex === 'new') {
      this.formArray().push(nextGroup);
    } else if (typeof targetIndex === 'number') {
      this.formArray().setControl(targetIndex, nextGroup);
    }

    this.closeDrawer();
  }

  protected remove(index: number): void {
    this.formArray().removeAt(index);
  }

  private createForm(value?: {
    team_name?: string;
    category?: string;
    model?: string;
    livery?: string;
    livery_id?: number;
    model_folder?: string;
  }): CarFormGroup {
    return new FormGroup({
      team_name: new FormControl(value?.team_name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      category: new FormControl(value?.category ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      model: new FormControl(value?.model ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      livery: new FormControl(value?.livery ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      livery_id: new FormControl(value?.livery_id ?? 0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      model_folder: new FormControl(value?.model_folder ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
