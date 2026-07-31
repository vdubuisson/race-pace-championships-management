import { computed, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

export type LoaderConfig = {
  text: string;
  moreVisible: boolean;
};

@Service()
export class GlobalLoader {
  private readonly router = inject(Router);

  private readonly config = signal<LoaderConfig>({
    text: '',
    moreVisible: false,
  });
  private readonly loadingCount = signal(0);

  readonly isLoading = computed(() => this.loadingCount() > 0);
  readonly text = computed(() => this.config().text);
  readonly moreVisible = computed(() => this.config().moreVisible);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.showLoader();
      }
      if (event instanceof RouteConfigLoadEnd) {
        this.hideLoader();
      }
    });
  }

  showLoader(text = '', moreVisible = false): void {
    this.config.set({
      text,
      moreVisible,
    });
    this.loadingCount.update((count) => count + 1);
  }

  hideLoader(): void {
    this.loadingCount.update((count) => count - 1);
  }
}
