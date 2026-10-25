import { ImportFilesControl } from '@/shared/components/import-files-control/import-files-control';
import { Component, input, output } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import {
  OPTIONAL_FILES,
  REQUIRED_FILES,
  fileNamesValidator,
  filesCountValidator,
} from './validators/import-validators';

@Component({
  selector: 'app-import-custom-section',
  imports: [ImportFilesControl, TuiHeader, TuiTitle],
  templateUrl: './import-custom-section.html',
  styleUrl: './import-custom-section.css',
})
export class ImportCustomSection {
  readonly importError = input<string | null>(null);
  readonly import = output<File[]>();

  protected readonly REQUIRED_FILES = REQUIRED_FILES;
  protected readonly OPTIONAL_FILES = OPTIONAL_FILES;

  protected readonly validators = [filesCountValidator, fileNamesValidator];
  protected readonly validFileNames = [...REQUIRED_FILES, ...OPTIONAL_FILES];

  protected async importFiles(files: File[]): Promise<void> {
    this.import.emit(files);
  }
}
