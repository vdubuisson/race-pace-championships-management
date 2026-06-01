import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDialogService,
  TuiGroup,
  TuiIcon,
  TuiLoader,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiButtonLoading } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { CsvImporter } from '../csv-importer/csv-importer';
import { ImportCustomSection } from '../import-custom/import-custom-section';
import { ResourceImporter } from '../resource-importer/resource-importer';

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.html',
  styleUrl: './import-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImportCustomSection,
    RouterLink,
    TuiButton,
    TuiButtonLoading,
    TuiGroup,
    TuiHeader,
    TuiIcon,
    TuiLoader,
    TuiTitle,
  ],
})
export class ImportPage {
  private readonly csvImporter = inject(CsvImporter);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly resourceImporter = inject(ResourceImporter);
  private readonly router = inject(Router);

  protected readonly importingOriginal = signal(false);
  protected readonly importingBlitzerNoMods = signal(false);
  protected readonly importingBlitzerModded = signal(false);
  protected readonly importingCustom = signal(false);

  protected readonly customImportError = signal<string | null>(null);

  protected readonly importing = computed(
    () =>
      this.importingOriginal() ||
      this.importingBlitzerNoMods() ||
      this.importingBlitzerModded() ||
      this.importingCustom(),
  );

  protected importOriginal(): void {
    this.showConfirmAndImport(
      this.importingOriginal,
      this.resourceImporter.importOriginalChampionships(),
    );
  }

  protected importBlitzerNoMods(): void {
    this.showConfirmAndImport(
      this.importingBlitzerNoMods,
      this.resourceImporter.importBlitzerNoModsChampionships(),
    );
  }

  protected importBlitzerModded(): void {
    this.showConfirmAndImport(
      this.importingBlitzerModded,
      this.resourceImporter.importBlitzerModdedChampionships(),
    );
  }

  protected importCustom(files: File[]): void {
    this.showConfirmAndImport(
      this.importingCustom,
      this.csvImporter.importCustomChampionships(files),
    );
  }

  private showConfirmation(): Observable<boolean> {
    return this.dialogs.open<boolean>(TUI_CONFIRM, {
      label: 'Import championships',
      size: 's',
      data: {
        content: 'This will overwrite all loaded championships. Are you sure you want to continue?',
        yes: 'Yes',
        no: 'No',
        appearance: 'primary',
      },
    });
  }

  private showConfirmAndImport(
    importingSignal: WritableSignal<boolean>,
    importObservable: Observable<void>,
  ): void {
    this.showConfirmation()
      .pipe(
        switchMap((confirmed) => {
          if (confirmed) {
            importingSignal.set(true);
            return this.doImport(importObservable);
          }
          return of(undefined);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => importingSignal.set(false),
      });
  }

  private doImport(importObservable: Observable<void>): Observable<void> {
    return importObservable.pipe(
      tap(() => {
        this.notifications
          .open('Data imported successfully!', {
            appearance: 'positive',
            autoClose: 3000,
            closable: false,
          })
          .subscribe();
        this.router.navigate(['/']);
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
        if (this.importingCustom()) {
          this.customImportError.set(error instanceof Error ? error.message : 'Unknown error');
        }
        return of(undefined);
      }),
    );
  }
}
