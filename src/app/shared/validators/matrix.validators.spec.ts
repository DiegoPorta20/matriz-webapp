import { FormControl } from '@angular/forms';

import { describeCellError, finiteNumberValidator } from './matrix.validators';

describe('finiteNumberValidator', () => {
  const validate = (value: number | string | null): ReturnType<typeof finiteNumberValidator> =>
    finiteNumberValidator(new FormControl(value));

  it('acepta un número', () => {
    expect(validate(0)).toBeNull();
    expect(validate(-1.5)).toBeNull();
  });

  it('rechaza un valor vacío', () => {
    expect(validate(null)).toEqual({ requiredNumber: true });
    expect(validate('')).toEqual({ requiredNumber: true });
  });

  it('rechaza un valor no numérico', () => {
    expect(validate('abc')).toEqual({ notFiniteNumber: true });
  });

  it('rechaza Infinity y NaN', () => {
    expect(validate(Number.POSITIVE_INFINITY)).toEqual({ notFiniteNumber: true });
    expect(validate(Number.NaN)).toEqual({ notFiniteNumber: true });
  });
});

describe('describeCellError', () => {
  it('no describe nada cuando el control es válido', () => {
    expect(describeCellError(null)).toBe('');
  });

  it('describe cada error con un mensaje propio', () => {
    expect(describeCellError({ requiredNumber: true })).toBe('Obligatorio');
    expect(describeCellError({ notFiniteNumber: true })).toBe('Debe ser un número finito');
  });

  it('tiene un mensaje por defecto para un error desconocido', () => {
    expect(describeCellError({ somethingElse: true })).toBe('Valor inválido');
  });
});
