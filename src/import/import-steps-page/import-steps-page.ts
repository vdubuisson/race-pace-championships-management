import { ChampionshipsTable } from '@/championships/championships-table/championships-table';
import { DriversTable } from '@/drivers/drivers-table/drivers-table';
import { GlobalLoader } from '@/shared/services/global-loader/global-loader';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiDialogService, TuiNotificationService, TuiTitle } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiStepper } from '@taiga-ui/kit';
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
    TuiStepper,
    TuiTitle,
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
    },
    {
      id: -1,
      separator: true,
    },
    {
      id: 1,
      label: 'Additional teams',
      icon: '@tui.briefcase-business',
    },
    {
      id: -2,
      separator: true,
    },
    {
      id: 2,
      label: 'Drivers',
      icon: '@tui.id-card-lanyard',
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
    this.importStore.selectedAdditionalTeamIds.set(selectedIds);
  }

  protected selectDriverIds(selectedIds: number[]): void {
    this.importStore.selectedDriverIds.set(selectedIds);
  }

  protected async showConfirmAndImport(): Promise<void> {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Import selected championships',
        size: 's',
        data: {
          content:
            'This will overwrite all existing championships. Are you sure you want to continue?',
          yes: 'Yes',
          no: 'No',
          appearance: 'primary',
        },
      })
      .pipe(
        switchMap((confirmed) => {
          if (confirmed) {
            this.globalLoader.showLoader('Importing selected items...');
            return this.doImport();
          }
          return of(undefined);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => this.globalLoader.hideLoader(),
      });
  }

  private doImport(): Observable<void> {
    return from(this.importStore.loadIntoDb()).pipe(
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
