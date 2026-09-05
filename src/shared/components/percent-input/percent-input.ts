import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiError, TuiIcon } from '@taiga-ui/core';
import { TuiInputSlider, TuiTooltip } from '@taiga-ui/kit';

@Component({
  selector: 'app-percent-input',
  templateUrl: './percent-input.html',
  styleUrl: './percent-input.css',
  imports: [ReactiveFormsModule, TuiError, TuiIcon, TuiInputSlider, TuiTooltip],
})
export class PercentInput {
  readonly title = input.required<string>();
  readonly control = input.required<FormControl>();

  readonly tooltip = input<string>();
  readonly size = input<'l' | 'm'>('m');
}
