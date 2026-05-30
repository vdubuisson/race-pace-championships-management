import { CsvExporter } from '@/export/csv-exporter';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiTitle, TuiButton } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TuiHeader, TuiTitle, TuiButton, TuiButtonLoading],
})
export class HomePage {
  private readonly csvExporter = inject(CsvExporter);

  readonly isExporting = signal(false);

  async exportData(): Promise<void> {
    this.isExporting.set(true);
    try {
      await this.csvExporter.downloadCsvsZip();
    } finally {
      this.isExporting.set(false);
    }
  }
}
