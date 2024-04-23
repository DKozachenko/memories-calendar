import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function filePathValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value: string | null = control.value;
    const PATH_REGEXP: RegExp = /(^[A-Z]{1}:)*((\\|\/){1}[0-9A-ZА-Яa-zа-я., -]+)+$/g;

    if (!value || PATH_REGEXP.test(value)) {
      return null;
    }

    return { incorrectFilePath: value };
  };
}
