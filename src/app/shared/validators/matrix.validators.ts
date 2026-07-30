import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const finiteNumberValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: unknown = control.value;

  if (value === null || value === '') {
    return { requiredNumber: true };
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { notFiniteNumber: true };
  }

  return null;
};

export const describeCellError = (errors: ValidationErrors | null): string => {
  if (errors === null) {
    return '';
  }
  if (errors['requiredNumber'] === true) {
    return 'Obligatorio';
  }
  if (errors['notFiniteNumber'] === true) {
    return 'Debe ser un número finito';
  }
  return 'Valor inválido';
};
