import { computed, Service, signal } from '@angular/core';

export type LoaderConfig = {
  isLoading: boolean;
  text: string;
  moreVisible: boolean;
};

@Service()
export class GlobalLoader {
  private readonly config = signal<LoaderConfig>({
    isLoading: false,
    text: '',
    moreVisible: false,
  });

  readonly isLoading = computed(() => this.config().isLoading);
  readonly text = computed(() => this.config().text);
  readonly moreVisible = computed(() => this.config().moreVisible);

  showLoader(text = '', moreVisible = false): void {
    this.config.set({
      isLoading: true,
      text,
      moreVisible,
    });
  }

  hideLoader(): void {
    this.config.set({
      isLoading: false,
      text: '',
      moreVisible: false,
    });
  }
}
