import { COUNTRIES } from '@/shared/constants/countries';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countryName',
})
export class CountryNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    if (value.length === 2) {
      return COUNTRIES.find((country) => country.iso2 === value)?.name ?? value;
    }
    if (value.length === 3) {
      return COUNTRIES.find((country) => country.iso3 === value)?.name ?? value;
    }
    return value;
  }
}
