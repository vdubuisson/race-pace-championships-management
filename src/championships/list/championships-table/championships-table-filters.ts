import { ChampionshipRepository } from '@/db/championship-repository';
import { Championship } from '@/shared/models/championship';
import { computed, inject, linkedSignal, Service, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';

@Service({ autoProvided: false })
export class ChampionshipsTableFilters {
  private readonly championshipRepository = inject(ChampionshipRepository);

  private readonly championships = toSignal(this.championshipRepository.getAllChampionships(), {
    initialValue: [],
  });

  readonly excludedTags = signal<string[]>([]);

  readonly categoriesOptions = computed(() => {
    const categoriesSet = new Set<string>();
    this.championships()
      .flatMap((championship) => championship.categories)
      .forEach((cat) => categoriesSet.add(cat));
    return Array.from(categoriesSet).toSorted();
  });

  readonly tagsOptions = computed(() => {
    const tagsSet = new Set<string>();
    this.championships()
      .flatMap((championship) => championship.tags)
      .filter((tag) => tag?.length)
      .filter((tag) => !this.excludedTags().includes(tag))
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
    category: new FormControl(''),
    startYear: new FormControl<number | null>(null),
    endYear: new FormControl<number | null>(null),
    prestige: new FormControl<number | null>(null),
    eventsCount: new FormControl<number | null>(null),
    tag: new FormControl(''),
    defaultIncluded: new FormControl(false, { nonNullable: true }),
    selected: new FormControl<number[]>([], { nonNullable: true }),
  });

  readonly filteredChampionships = linkedSignal(() =>
    this.applyExclusionsAndFilters(this.championships()),
  );

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const filtered = this.applyExclusionsAndFilters(this.championships());
      this.filteredChampionships.set(filtered);
    });
  }

  private applyExclusionsAndFilters(championships: Championship[]): Championship[] {
    let filteredChampionships = this.applyTagsExclusion(championships);
    return this.applyFilters(filteredChampionships);
  }

  private applyFilters(championships: Championship[]): Championship[] {
    let filtered = [...championships];
    const nameFilter = this.form.controls.name.value || '';
    const categoryFilter = this.form.controls.category.value || '';
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
    if (categoryFilter?.length > 0) {
      filtered = filtered.filter((championship) =>
        championship.categories.includes(categoryFilter),
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

  private applyTagsExclusion(championships: Championship[]) {
    return championships.filter(
      (championship) => !championship.tags.some((tag) => this.excludedTags().includes(tag)),
    );
  }
}
