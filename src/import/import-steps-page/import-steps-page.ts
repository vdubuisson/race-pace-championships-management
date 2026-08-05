import { ChampionshipsTable } from '@/championships/championships-table/championships-table';
import { DriversTable } from '@/drivers/drivers-table/drivers-table';
import { GlobalLoader } from '@/shared/services/global-loader/global-loader';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDialogService,
  TuiIcon,
  TuiNotificationService,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiStepper, TuiTooltip } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { catchError, from, Observable, of, switchMap, tap } from 'rxjs';
import { ImportStore } from '../import-store/import-store';
import { TeamsTable } from './teams-table/teams-table';

@Component({
  selector: 'app-import-steps-page',
  templateUrl: './import-steps-page.html',
  styleUrl: './import-steps-page.css',
  imports: [
    ChampionshipsTable,
    DriversTable,
    RouterLink,
    TeamsTable,
    TuiButton,
    TuiHeader,
    TuiIcon,
    TuiStepper,
    TuiTitle,
    TuiTooltip,
  ],
})
export default class ImportStepsPage {
  protected readonly importStore = inject(ImportStore);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notifications = inject(TuiNotificationService);
  private readonly globalLoader = inject(GlobalLoader);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly activeStepIndex = signal(0);

  protected readonly steps = [
    {
      id: 0,
      label: 'Championships',
      icon: '@tui.trophy',
      tooltip:
        'Select the championships you want to import. <br> <strong>Note:</strong> Orange lines indicate an existing championship with the same name. If selected, the imported championship will overwrite the existing one.',
    },
    {
      id: -1,
      separator: true,
    },
    {
      id: 1,
      label: 'Teams',
      icon: '@tui.briefcase-business',
      tooltip:
        'Select the teams you want to import.<br> Teams from the selected championships are already selected. <br> <strong>Note:</strong> Orange lines indicate an existing team with the same name. If selected, the imported team will overwrite the existing one.',
    },
    {
      id: -2,
      separator: true,
    },
    {
      id: 2,
      label: 'Drivers',
      icon: '@tui.id-card-lanyard',
      tooltip: 'Select the drivers you want to import.',
    },
  ];
  protected readonly stepsCount = this.steps.filter((step) => !step.separator).length;

  protected goToPreviousStep(): void {
    this.activeStepIndex.update((value) => Math.max(value - 1, 0));
  }

  protected goToNextStep(): void {
    this.activeStepIndex.update((value) => Math.min(value + 1, this.stepsCount - 1));
  }

  protected selectChampionshipIds(selectedIds: number[]): void {
    this.importStore.selectedChampionshipIds.set(selectedIds);
  }

  protected selectTeamIds(selectedIds: number[]): void {
    this.importStore.selectedTeamIds.set(selectedIds);
  }

  protected selectDriverIds(selectedIds: number[]): void {
    this.importStore.selectedDriverIds.set(selectedIds);
  }

  protected async showConfirmAndImport(): Promise<void> {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Import selected content',
        size: 'm',
        data: {
          content:
            'Do you want to completely overwrite your existing data with the selected content, or do you want to import the selected content while keeping your existing data? <small>(in case of conflict, the selected content will overwrite the existing one)</small>',
          yes: 'Import with overwrite',
          no: 'Import with keeping',
          appearance: 'primary',
        },
      })
      .pipe(
        tap(() => this.globalLoader.showLoader('Importing selected items...')),
        switchMap((isOverwrite) => this.doImport(isOverwrite)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => this.globalLoader.hideLoader(),
      });
  }

  private doImport(isOverwrite: boolean): Observable<void> {
    return from(this.importStore.loadIntoDb(isOverwrite)).pipe(
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
        return of(undefined);
      }),
    );
  }
}
