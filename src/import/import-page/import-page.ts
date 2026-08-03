import { GlobalLoader } from '@/shared/services/global-loader/global-loader';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiGroup, TuiIcon, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import { catchError, Observable, of, tap } from 'rxjs';
import { CsvImporter } from '../csv-importer/csv-importer';
import { ImportCustomSection } from '../import-custom/import-custom-section';
import ResourceImporter from '../resource-importer/resource-importer';

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.html',
  styleUrl: './import-page.css',
  imports: [ImportCustomSection, RouterLink, TuiButton, TuiGroup, TuiHeader, TuiIcon, TuiTitle],
})
export class ImportPage {
  private readonly csvImporter = inject(CsvImporter);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(TuiNotificationService);
  private readonly resourceImporter = inject(ResourceImporter);
  private readonly router = inject(Router);
  private readonly globalLoader = inject(GlobalLoader);

  protected readonly customImportError = signal<string | null>(null);

  protected importOriginal(): void {
    this.showLoaderAndImport(
      'Importing original championships...',
      this.resourceImporter.importOriginalChampionships(),
    );
  }

  protected importBlitzerNoMods(): void {
    this.showLoaderAndImport(
      'Importing Blitzer no mods championships...',
      this.resourceImporter.importBlitzerNoModsChampionships(),
    );
  }

  protected importBlitzerModded(): void {
    this.showLoaderAndImport(
      'Importing Blitzer modded championships...',
      this.resourceImporter.importBlitzerModdedChampionships(),
    );
  }

  protected importCustom(files: File[]): void {
    this.showLoaderAndImport(
      'Importing custom championships...',
      this.csvImporter.importCustomChampionships(files),
      true,
    );
  }

  private showLoaderAndImport(
    loaderText: string,
    importObservable: Observable<void>,
    isCustom = false,
  ): void {
    this.globalLoader.showLoader(loaderText, true);
    importObservable
      .pipe(
        tap(() => {
          this.router.navigate(['/import', 'steps']);
        }),
        catchError((error) => {
          console.error('Error importing data:', error);
          this.notifications
            .open(error.message, {
              label: 'Error importing data',
              appearance: 'negative',
              autoClose: 0,
              closable: true,
            })
            .subscribe();
          if (isCustom) {
            this.customImportError.set(error instanceof Error ? error.message : 'Unknown error');
          }
          return of(undefined);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => this.globalLoader.hideLoader(),
      });
  }
}
