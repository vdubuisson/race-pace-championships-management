import VersionChecker from '@/import/version-checker/version-checker';
import { GlobalLoader } from '@/shared/services/global-loader/global-loader';
import { Component, inject, injectAsync } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TUI_DARK_MODE, TuiLoader, TuiNotificationService, TuiRoot } from '@taiga-ui/core';
import { catchError, from, of, switchMap, tap } from 'rxjs';
import { Menu } from './menu/menu';

@Component({
  selector: 'app-root',
  imports: [Menu, RouterOutlet, TuiLoader, TuiRoot],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly darkMode = inject(TUI_DARK_MODE);

  private readonly notifications = inject(TuiNotificationService);
  private readonly versionChecker = inject(VersionChecker);
  private readonly resourceImporter = injectAsync(
    () => import('@/import/resource-importer/resource-importer'),
  );

  protected readonly globalLoader = inject(GlobalLoader);

  constructor() {
    // this.darkMode.set(true);
    this.checkAndImportBaseResources();
  }

  private checkAndImportBaseResources(): void {
    this.globalLoader.showLoader('Importing base resources...');

    this.versionChecker
      .needToImportBaseResources()
      .pipe(
        switchMap((needToImport) => {
          if (needToImport) {
            return from(this.resourceImporter()).pipe(
              switchMap((resourceImporter) => resourceImporter.importBaseResources()),
              tap(() => this.versionChecker.setLocalBaseResourcesVersion()),
            );
          }
          return of(null);
        }),
        catchError((error) => {
          this.notifications.open(error.message, {
            label: 'Error importing base resources',
            appearance: 'negative',
            autoClose: 0,
            closable: true,
          });
          return of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        complete: () => {
          this.globalLoader.hideLoader();
        },
      });
  }
}
