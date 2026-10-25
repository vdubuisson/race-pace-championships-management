import { AsyncPipe } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { TuiValidationError } from '@taiga-ui/cdk';
import { TuiButton, TuiError } from '@taiga-ui/core';
import { TuiFiles, tuiFilesAccepted, TuiInputFiles } from '@taiga-ui/kit';
import { map } from 'rxjs';
import { RejectedFilePipe } from './rejected-file-pipe/rejected-file-pipe';

@Component({
  selector: 'app-import-files-control',
  templateUrl: './import-files-control.html',
  styleUrl: './import-files-control.css',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    RejectedFilePipe,
    TuiButton,
    TuiError,
    TuiFiles,
    TuiInputFiles,
  ],
})
export class ImportFilesControl {
  readonly controlValidators = input<ValidatorFn[]>([]);
  readonly acceptedFileTypes = input<string[]>([]);
  readonly validFileNames = input<string[]>([]);
  readonly validExtensions = input<string[]>([]);
  readonly importError = input<string | null>(null);

  readonly import = output<File[]>();

  protected readonly filesControl = new FormControl<File[]>([], {
    validators: this.controlValidators(),
  });

  protected readonly rejectedFiles = signal<File[]>([]);

  protected readonly acceptedFiles$ = this.filesControl.valueChanges.pipe(
    map(() => tuiFilesAccepted(this.filesControl)),
    map((files) => {
      const validFiles: File[] = [];
      files.forEach((file) => {
        if (
          this.validFileNames().includes(file.name) ||
          this.validExtensions().some((ext) => file.name.endsWith(ext))
        ) {
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

    effect(() => {
      this.filesControl.setValidators(this.controlValidators());
      this.filesControl.updateValueAndValidity();
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
      // this.filesControl.reset();
      this.rejectedFiles.set([]);
    }
  }
}
