import { ValidatorFn } from '@angular/forms';
import { TuiValidationError } from '@taiga-ui/cdk/classes';

export const REQUIRED_FILES = ['cars.csv', 'championships.csv', 'events.csv', 'teams.csv'];

export const filesCountValidator: ValidatorFn = (control) => {
  const files: File[] = control.value ?? [];
  if (files.length < REQUIRED_FILES.length) {
    const missingFiles = REQUIRED_FILES.filter(
      (requiredFile) => !files.some((file) => file.name === requiredFile),
    );
    return {
      filesCount: new TuiValidationError(
        `Missing ${missingFiles.length} file(s): ${missingFiles.join(', ')}.`,
      ),
    };
  }
  if (files.length > REQUIRED_FILES.length) {
    return {
      filesCount: new TuiValidationError(
        `Too many files. Expected ${REQUIRED_FILES.length}, got ${files.length}.`,
      ),
    };
  }
  return null;
};

export const fileNamesValidator: ValidatorFn = (control) => {
  const files: File[] = control.value ?? [];
  if (files.some((file) => !REQUIRED_FILES.includes(file.name))) {
    return {
      fileNames: new TuiValidationError(
        `Some invalid file names. Expected: ${REQUIRED_FILES.join(', ')}.`,
      ),
    };
  }
  return null;
};
