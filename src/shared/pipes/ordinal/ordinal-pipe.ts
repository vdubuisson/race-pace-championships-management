import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinal',
})
export class OrdinalPipe implements PipeTransform {
  transform(value: number | string | null | undefined, onlySuffix = false): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    const absoluteValue = Math.abs(Math.trunc(numericValue));

    const suffix = this.getOrdinalSuffix(absoluteValue);

    return onlySuffix ? suffix : `${absoluteValue}${suffix}`;
  }

  private getOrdinalSuffix(value: number): string {
    const lastTwoDigits = value % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return 'th';
    }

    switch (value % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }
}
