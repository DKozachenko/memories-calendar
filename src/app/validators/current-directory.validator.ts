import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { StoreService } from '../services';

export function currentDirectoryValidator(storeService: StoreService): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const currentDirectory: string | null = storeService.getDirectory();

    const value: string | null = control.value;

    if (!currentDirectory || !value || currentDirectory !== value) {
      return null;
    }

    return { currentDirectory };
  };
}
