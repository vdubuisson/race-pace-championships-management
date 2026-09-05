import { Driver } from '@/shared/models/driver';
import { VehicleClassNamePipe } from '@/shared/pipes/vehicle-class-name/vehicle-class-name-pipe';
import { Component, input } from '@angular/core';
import { TuiHint, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

type CardMode = 'team' | 'championship' | 'category';

@Component({
  selector: 'app-driver-card',
  templateUrl: './driver-card.html',
  styleUrl: './driver-card.css',
  imports: [
    TuiAutoColorPipe,
    TuiCardLarge,
    TuiChip,
    TuiHeader,
    TuiHint,
    TuiTitle,
    VehicleClassNamePipe,
  ],
})
export class DriverCard {
  readonly driver = input.required<Driver>();
  readonly mode = input<CardMode>('category');
}
