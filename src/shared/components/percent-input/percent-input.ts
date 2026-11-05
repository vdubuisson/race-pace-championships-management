import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { TuiError, TuiIcon } from '@taiga-ui/core';
import { TuiInputSlider, TuiTooltip } from '@taiga-ui/kit';

@Component({
  selector: 'app-percent-input',
  templateUrl: './percent-input.html',
  styleUrl: './percent-input.css',
  imports: [FormsModule, TuiError, TuiIcon, TuiInputSlider, TuiTooltip],
})
export class PercentInput implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  readonly title = input.required<string>();

  readonly tooltip = input<string>();
  readonly size = input<'l' | 'm'>('m');
}
