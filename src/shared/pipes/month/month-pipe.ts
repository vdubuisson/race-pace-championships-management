import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'month',
})
export class MonthPipe implements PipeTransform {
  private readonly datePipe = inject(DatePipe);

  transform(value: number | string | null | undefined, format: 'short' | 'long' = 'long'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    const date = new Date(2026, numericValue - 1, 1);
    return this.datePipe.transform(date, format === 'short' ? 'MMM' : 'MMMM') ?? '';
  }
}
