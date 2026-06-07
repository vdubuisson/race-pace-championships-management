import { ChampionshipWithClasses } from '@/shared/models/championship';
import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { ChampionshipsService } from '../championships-service/championships-service';

@Injectable()
export class ChampionshipsListFilters {
  private readonly championshipService = inject(ChampionshipsService);

  protected readonly championships = toSignal(this.championshipService.getChampionships(), {
    initialValue: [],
  });

  readonly categoriesOptions = computed(() => {
    const categoriesSet = new Set<string>();
    this.championships()
      .flatMap((championship) => championship.classes)
      .filter((cat) => cat.name?.length)
      .forEach((cat) => categoriesSet.add(cat.name!));
    return Array.from(categoriesSet).toSorted();
  });

  readonly tagsOptions = computed(() => {
    const tagsSet = new Set<string>();
    this.championships()
      .flatMap((championship) => championship.tags)
      .filter((tag) => tag?.length)
      .forEach((tag) => tagsSet.add(tag));
    return Array.from(tagsSet).toSorted();
  });

  readonly startYearOptions = computed(() => {
    const yearsSet = new Set<number>();
    this.championships()
      .map((championship) => championship.start_year)
      .filter((year) => year !== null)
      .forEach((year) => yearsSet.add(year));
    return Array.from(yearsSet).toSorted();
  });

  readonly endYearOptions = computed(() => {
    const yearsSet = new Set<number>();
    this.championships()
      .map((championship) => championship.end_year)
      .filter((year) => year !== null)
      .forEach((year) => yearsSet.add(year));
    return Array.from(yearsSet).toSorted();
  });

  readonly form = new FormGroup({
    name: new FormControl(''),
    categoryName: new FormControl(''),
    startYear: new FormControl<number | null>(null),
    endYear: new FormControl<number | null>(null),
    prestige: new FormControl<number | null>(null),
    eventsCount: new FormControl<number | null>(null),
    tag: new FormControl(''),
    defaultIncluded: new FormControl(false, { nonNullable: true }),
  });

  readonly filteredChampionships = linkedSignal(() => this.applyFilters(this.championships()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const filtered = this.applyFilters(this.championships());
      this.filteredChampionships.set(filtered);
    });
  }

  private applyFilters(championships: ChampionshipWithClasses[]): ChampionshipWithClasses[] {
    let filtered = [...championships];
    const nameFilter = this.form.controls.name.value || '';
    const categoryNameFilter = this.form.controls.categoryName.value || '';
    const tagFilter = this.form.controls.tag.value || '';
    const startYearFilter = this.form.controls.startYear.value;
    const endYearFilter = this.form.controls.endYear.value;
    const prestigeFilter = this.form.controls.prestige.value;
    const eventsCountFilter = this.form.controls.eventsCount.value;
    const defaultIncludedFilter = this.form.controls.defaultIncluded.value;

    if (nameFilter?.length > 0) {
      filtered = filtered.filter((championship) =>
        championship.name.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }
    if (categoryNameFilter?.length > 0) {
      filtered = filtered.filter((championship) =>
        championship.classes.some((cat) => cat.name === categoryNameFilter),
      );
    }
    if (startYearFilter !== null) {
      filtered = filtered.filter((championship) => championship.start_year === startYearFilter);
    }
    if (endYearFilter !== null) {
      filtered = filtered.filter((championship) => championship.end_year === endYearFilter);
    }
    if (prestigeFilter !== null) {
      filtered = filtered.filter((championship) => championship.prestige === prestigeFilter);
    }
    if (eventsCountFilter !== null) {
      filtered = filtered.filter((championship) => championship.events_count === eventsCountFilter);
    }
    if (tagFilter?.length > 0) {
      filtered = filtered.filter((championship) =>
        championship.tags.some((tag) => tag === tagFilter),
      );
    }
    if (defaultIncludedFilter) {
      filtered = filtered.filter((championship) => championship.default_included);
    }
    return filtered;
  }
}
