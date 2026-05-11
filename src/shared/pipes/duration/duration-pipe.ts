import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    const totalMinutes = Math.trunc(numericValue);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} min`;
    }

    const hourLabel = hours === 1 ? 'hour' : 'hours';

    if (minutes === 0) {
      return `${hours} ${hourLabel}`;
    }

    return `${hours} ${hourLabel} ${minutes} min`;
  }
}
