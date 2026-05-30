import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiValidationError } from '@taiga-ui/cdk/classes';
import { TuiButton, TuiError, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiButtonLoading, TuiFiles, TuiInputFiles, tuiFilesAccepted } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { map } from 'rxjs';
import { CsvImporter } from '../csv-importer/csv-importer';
import { RejectedFilePipe } from '../rejected-file-pipe/rejected-file-pipe';
import { CsvValidationError } from '../validators/csv-validation-error';
import {
  REQUIRED_FILES,
  fileNamesValidator,
  filesCountValidator,
} from '../validators/import-validators';

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RejectedFilePipe,
    RouterLink,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiFiles,
    TuiHeader,
    TuiInputFiles,
    TuiTitle,
  ],
  templateUrl: './import-custom-page.html',
  styleUrl: './import-custom-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportCustomPage {
  private readonly csvImporter = inject(CsvImporter);
  private readonly notifications = inject(TuiNotificationService);
  private readonly router = inject(Router);

  protected readonly REQUIRED_FILES = REQUIRED_FILES;

  protected readonly filesControl = new FormControl<File[]>([], {
    validators: [filesCountValidator, fileNamesValidator],
  });
  protected readonly rejectedFiles = signal<File[]>([]);
  protected readonly importing = signal(false);

  protected readonly acceptedFiles$ = this.filesControl.valueChanges.pipe(
    map(() => tuiFilesAccepted(this.filesControl)),
    map((files) => {
      const validFiles: File[] = [];
      files.forEach((file) => {
        if (REQUIRED_FILES.includes(file.name)) {
          validFiles.push(file);
        } else {
          this.onReject([file]);
        }
      });
      return validFiles;
    }),
  );

  protected onReject(files: File[]): void {
    this.rejectedFiles.update((current) => Array.from(new Set([...current, ...files])));
  }

  protected removeFile(file: File): void {
    this.rejectedFiles.update((current) => current.filter((f) => f !== file));
    this.filesControl.setValue(this.filesControl.value?.filter((f) => f !== file) ?? []);
  }

  protected async importFiles(): Promise<void> {
    if (this.filesControl.invalid) return;

    this.importing.set(true);
    try {
      await this.csvImporter.importCustomChampionships(this.filesControl.value!);

      this.notifications
        .open('Data imported successfully!', {
          appearance: 'positive',
          autoClose: 3000,
          closable: false,
        })
        .subscribe();
      this.router.navigate(['/']);
    } catch (error) {
      if (error instanceof CsvValidationError) {
        this.filesControl.setErrors({ structure: new TuiValidationError(error.message) });
      } else {
        this.filesControl.setErrors({
          structure: new TuiValidationError(
            `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ),
        });
      }
    } finally {
      this.importing.set(false);
    }
  }
}
