import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  imports: [RouterLink, TuiNavigation],
})
export class Menu {
  protected readonly expanded = signal(false);

  toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }
}
