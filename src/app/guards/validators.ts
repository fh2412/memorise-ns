import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    // If no date is entered, pass validation. 
    // (Let the 'Validators.required' handle empty states where necessary)
    if (!value) {
      return null; 
    }

    const inputDate = new Date(value);
    const now = new Date();

    // Returns null if valid (in the past), or an error object if invalid (in the future)
    return inputDate < now ? null : { notInPast: true };
  };
}