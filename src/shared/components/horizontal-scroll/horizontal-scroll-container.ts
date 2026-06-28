import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-horizontal-scroll-container',
  templateUrl: './horizontal-scroll-container.html',
  styleUrl: './horizontal-scroll-container.css',
  imports: [TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalScrollContainer {
  readonly scrollContainerRef = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

  protected readonly scrollLeftDisabled = signal(true);

  protected readonly scrollRightDisabled = signal(false);

  protected readonly shouldShowButtons = signal(false);

  private readonly scrollContainerClientWidth = signal(0);

  constructor() {
    afterNextRender(() => {
      const scrollContainer = this.scrollContainerRef().nativeElement;
      scrollContainer.addEventListener('scroll', () => this.onScroll());
      this.scrollContainerClientWidth.set(scrollContainer.clientWidth);
      this.shouldShowButtons.set(scrollContainer.scrollWidth > scrollContainer.clientWidth);
    });
  }

  protected scrollLeft(): void {
    this.scrollContainerRef().nativeElement.scrollBy({
      left: -(this.scrollContainerClientWidth() - 100),
      behavior: 'smooth',
    });
  }

  protected scrollRight(): void {
    this.scrollContainerRef().nativeElement.scrollBy({
      left: this.scrollContainerClientWidth() - 100,
      behavior: 'smooth',
    });
  }

  private onScroll(): void {
    const scrollContainer = this.scrollContainerRef().nativeElement;
    this.scrollLeftDisabled.set(scrollContainer.scrollLeft === 0);
    this.scrollRightDisabled.set(
      scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth,
    );
  }
}
