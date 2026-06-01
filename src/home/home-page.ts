import { CsvExporter } from '@/export/csv-exporter';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiTitle, TuiButton, TuiGroup, TuiIcon, TuiNotificationService } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TuiGroup, TuiHeader, TuiIcon, TuiTitle, TuiButton, TuiButtonLoading],
})
export class HomePage {
  private readonly csvExporter = inject(CsvExporter);
  private readonly notifications = inject(TuiNotificationService);

  readonly isExportingWithMods = signal(false);
  readonly isExportingWithoutMods = signal(false);
  readonly isExporting = computed(
    () => this.isExportingWithMods() || this.isExportingWithoutMods(),
  );

  async exportDataWithMods(): Promise<void> {
    this.isExportingWithMods.set(true);
    try {
      await this.csvExporter.downloadCsvsZip();
    } catch (error) {
      this.displayError(error as Error);
    } finally {
      this.isExportingWithMods.set(false);
    }
  }

  async exportDataWithoutMods(): Promise<void> {
    this.isExportingWithoutMods.set(true);
    try {
      await this.csvExporter.downloadCsvsZipWithoutMods();
    } catch (error) {
      this.displayError(error as Error);
    } finally {
      this.isExportingWithoutMods.set(false);
    }
  }

  private displayError(error: Error): void {
    console.error('Error exporting data:', error);
    this.notifications
      .open(error.message, {
        label: 'Error exporting data',
        appearance: 'negative',
        autoClose: 0,
        closable: true,
      })
      .subscribe();
  }
}
