import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiTitle } from '@taiga-ui/core';
import { TuiDrawer, TuiInputNumber } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Track } from '@/resources/models/track';

type EventFormGroup = FormGroup<{
  track_id: FormControl<string>;
  name: FormControl<string>;
  month: FormControl<number>;
  week_end: FormControl<number>;
  mandatory: FormControl<boolean>;
  type: FormControl<'time' | 'laps'>;
  duration: FormControl<number>;
  start_time: FormControl<string>;
}>;

@Component({
  selector: 'app-championship-events-step',
  templateUrl: './championship-events-step.html',
  styleUrl: './championship-events-step.css',
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
export class ChampionshipEventsStep {
  readonly formArray = input.required<FormArray<EventFormGroup>>();
  readonly tracks = input.required<Track[]>();

  protected readonly editingIndex = signal<number | 'new' | null>(null);
  protected readonly draftForm = signal<EventFormGroup>(this.createForm());

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

  protected trackName(trackId: string): string {
    return this.tracks().find((track) => track.id === trackId)?.name ?? 'Unknown track';
  }

  private createForm(value?: {
    track_id?: string;
    name?: string;
    month?: number;
    week_end?: number;
    mandatory?: boolean;
    type?: 'time' | 'laps';
    duration?: number;
    start_time?: string;
  }): EventFormGroup {
    return new FormGroup({
      track_id: new FormControl(value?.track_id ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      name: new FormControl(value?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      month: new FormControl(value?.month ?? 1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      week_end: new FormControl(value?.week_end ?? 1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      mandatory: new FormControl(value?.mandatory ?? false, { nonNullable: true }),
      type: new FormControl(value?.type ?? 'time', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      duration: new FormControl(value?.duration ?? 20, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      start_time: new FormControl(value?.start_time ?? '', { nonNullable: true }),
    });
  }
}
