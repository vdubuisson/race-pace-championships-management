import { VersionRepository } from '@/db/version-repository';
import { ResourceImporter } from '@/import/resource-importer/resource-importer';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TUI_DARK_MODE, TuiLoader, TuiNotificationService, TuiRoot } from '@taiga-ui/core';
import { catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiLoader, TuiRoot],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly darkMode = inject(TUI_DARK_MODE);

  private readonly resourceImporter = inject(ResourceImporter);
  private readonly notifications = inject(TuiNotificationService);
  private readonly versionRepository = inject(VersionRepository);

  protected readonly importingBaseResources = signal(false);

  constructor() {
    // this.darkMode.set(true);
    this.checkAndImportBaseResources();
  }

  private checkAndImportBaseResources(): void {
    this.importingBaseResources.set(true);
    const localVersion = this.versionRepository.getLocalBaseResourcesVersion();
    this.resourceImporter
      .getRemoteBaseResourcesVersion()
      .pipe(
        switchMap((remoteVersion) => {
          if (remoteVersion > localVersion) {
            return this.resourceImporter
              .importBaseResources()
              .pipe(tap(() => this.versionRepository.setLocalBaseResourcesVersion(remoteVersion)));
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
          this.importingBaseResources.set(false);
        },
      });
  }
}
