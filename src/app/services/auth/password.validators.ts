import { AbstractControl, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export function passwordsMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    return !confirm || password === confirm ? null : { passwordsMismatch: true };
  };
}

export const notBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim().length === 0 && control.value.length > 0
    ? { blank: true }
    : null;

/** Shows the confirm field as invalid when the group has 'passwordsMismatch'. */
export class ConfirmPasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) return false;
    const interacted = control.touched || !!form?.submitted;
    return interacted && (control.invalid || !!form?.form.hasError('passwordsMismatch'));
  }
}
