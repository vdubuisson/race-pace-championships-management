import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiValidationError } from '@taiga-ui/cdk/classes';
import { TuiButton, TuiError, TuiTitle } from '@taiga-ui/core';
import { TuiButtonLoading, TuiFiles, TuiInputFiles, tuiFilesAccepted } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { map } from 'rxjs';
import { RejectedFilePipe } from './rejected-file-pipe/rejected-file-pipe';
import {
  REQUIRED_FILES,
  fileNamesValidator,
  filesCountValidator,
} from './validators/import-validators';

@Component({
  selector: 'app-import-custom-section',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RejectedFilePipe,
    TuiButton,
    TuiButtonLoading,
    TuiError,
    TuiFiles,
    TuiHeader,
    TuiInputFiles,
    TuiTitle,
  ],
  templateUrl: './import-custom-section.html',
  styleUrl: './import-custom-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportCustomSection {
  readonly importing = input(false);
  readonly importError = input<string | null>(null);
  readonly import = output<File[]>();

  protected readonly REQUIRED_FILES = REQUIRED_FILES;

  protected readonly filesControl = new FormControl<File[]>([], {
    validators: [filesCountValidator, fileNamesValidator],
  });
  protected readonly rejectedFiles = signal<File[]>([]);

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

  constructor() {
    effect(() => {
      if (this.importError()) {
        this.filesControl.setErrors({ structure: new TuiValidationError(this.importError()!) });
      } else {
        this.filesControl.setErrors(null);
      }
    });
  }

  protected onReject(files: File[]): void {
    this.rejectedFiles.update((current) => Array.from(new Set([...current, ...files])));
  }

  protected removeFile(file: File): void {
    this.rejectedFiles.update((current) => current.filter((f) => f !== file));
    this.filesControl.setValue(this.filesControl.value?.filter((f) => f !== file) ?? []);
  }

  protected async importFiles(): Promise<void> {
    if (this.filesControl.valid) {
      this.import.emit(this.filesControl.value!);
    }
  }
}
