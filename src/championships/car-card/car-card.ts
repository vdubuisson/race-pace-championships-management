import { Car } from '@/resources/models/car';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TuiButton, TuiGroup, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-car-card',
  templateUrl: './car-card.html',
  styleUrl: './car-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiAutoColorPipe, TuiButton, TuiCardLarge, TuiChip, TuiGroup, TuiHeader, TuiTitle],
})
export class CarCard {
  readonly car = input.required<Partial<Car>>();
  readonly editable = input(false);

  readonly delete = output<void>();
  readonly edit = output<void>();

  readonly shouldShowModel = computed(() => !this.car().livery?.includes(this.car().model!));
}
