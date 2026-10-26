import { ImportFilesControl } from '@/shared/components/import-files-control/import-files-control';
import { Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import { CustomLiveriesImporter } from '../custom-liveries-importer';

@Component({
  selector: 'app-custom-liveries-import-section',
  templateUrl: './custom-liveries-import-section.html',
  styleUrl: './custom-liveries-import-section.css',
  imports: [ImportFilesControl, TuiHeader, TuiTitle],
})
export class CustomLiveriesImportSection {
  private readonly importer = inject(CustomLiveriesImporter);
  private readonly notifications = inject(TuiNotificationService);

  protected readonly validators = [Validators.required];

  async importFiles(files: File[]): Promise<void> {
    try {
      await this.importer.importZipFiles(files);
      this.notifications
        .open('Import successful', {
          label: 'Success',
          appearance: 'positive',
          autoClose: 3000,
          closable: true,
        })
        .subscribe();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error importing data:', error);
      this.notifications
        .open(errorMessage, {
          label: 'Error importing data',
          appearance: 'negative',
          autoClose: 0,
          closable: true,
        })
        .subscribe();
    }
  }
}
