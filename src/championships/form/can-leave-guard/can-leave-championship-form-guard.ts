import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CanDeactivateFn } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';

export const canLeaveChampionshipFormGuard: CanDeactivateFn<boolean> = () => {
  const dialogs = inject(TuiDialogService);
  return dialogs
    .open<boolean>(TUI_CONFIRM, {
      label: 'Abort changes?',
      size: 's',
      data: {
        content: 'Are you sure you want to leave the form and abort your changes?',
        yes: 'Yes',
        no: 'No',
        appearance: 'primary-destructive',
      },
    })
    .pipe(takeUntilDestroyed());
};
