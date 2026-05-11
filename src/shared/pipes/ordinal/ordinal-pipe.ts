import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinal',
})
export class OrdinalPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    const absoluteValue = Math.abs(Math.trunc(numericValue));
    const lastTwoDigits = absoluteValue % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${numericValue}th`;
    }

    switch (absoluteValue % 10) {
      case 1:
        return `${numericValue}st`;
      case 2:
        return `${numericValue}nd`;
      case 3:
        return `${numericValue}rd`;
      default:
        return `${numericValue}th`;
    }
  }
}
