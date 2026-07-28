import { ChampionshipsTable } from '@/championships/list/championships-table/championships-table';
import { GlobalLoader } from '@/shared/services/global-loader/global-loader';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiCell, TuiInput, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import CsvExporter from '../csv-exporter';

@Component({
  selector: 'app-export-page',
  templateUrl: './export-page.html',
  styleUrl: './export-page.css',
  imports: [
    ChampionshipsTable,
    ReactiveFormsModule,
    RouterLink,
    TuiButton,
    TuiCell,
    TuiForm,
    TuiHeader,
    TuiInput,
    TuiSwitch,
    TuiTitle,
  ],
})
export class ExportPage {
  private readonly csvExporter = inject(CsvExporter);
  private readonly notifications = inject(TuiNotificationService);
  private readonly globalLoader = inject(GlobalLoader);

  protected readonly form = new FormGroup({
    championshipIds: new FormControl<number[]>([], {
      nonNullable: true,
      validators: Validators.required,
    }),
    filename: new FormControl('race_pace_custom_championships', {
      nonNullable: true,
      validators: Validators.required,
    }),
    withDrivers: new FormControl(true, { nonNullable: true }),
    withTrackMods: new FormControl(false, { nonNullable: true }),
  });

  protected selectChampionships(ids: number[]) {
    this.form.controls.championshipIds.setValue(ids);
  }

  protected async export(): Promise<void> {
    this.globalLoader.showLoader('Exporting championships...');
    try {
      await this.csvExporter.downloadCsvsZip(this.form.getRawValue());
    } catch (error) {
      this.displayError(error as Error);
    } finally {
      this.globalLoader.hideLoader();
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
