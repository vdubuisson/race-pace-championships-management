import { COUNTRIES } from '@/shared/constants/countries';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countryCode',
})
export class CountryCodePipe implements PipeTransform {
  transform(value: string | null | undefined, toIso: 2 | 3 = 2): string {
    if (!value) {
      return '';
    }
    if (toIso === 2) {
      return COUNTRIES.find((c) => c.iso3 === value)?.iso2 ?? value;
    }
    return COUNTRIES.find((c) => c.iso2 === value)?.iso3 ?? value;
  }
}
