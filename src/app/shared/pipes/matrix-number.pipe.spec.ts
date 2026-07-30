import { MatrixNumberPipe } from './matrix-number.pipe';

describe('MatrixNumberPipe', () => {
  const pipe = new MatrixNumberPipe();

  it('recorta a cuatro decimales', () => {
    expect(pipe.transform(-0.31622776601683794)).toBe('-0.3162');
  });

  it('quita los decimales que no aportan', () => {
    expect(pipe.transform(2.5)).toBe('2.5');
    expect(pipe.transform(3)).toBe('3');
  });

  it('muestra el residuo de punto flotante como cero', () => {
    expect(pipe.transform(1e-17)).toBe('0');
    expect(pipe.transform(-2.5e-18)).toBe('0');
  });

  it('no confunde el cero negativo con un número', () => {
    expect(pipe.transform(-0)).toBe('0');
  });

  it('conserva un valor pequeño pero representable', () => {
    expect(pipe.transform(0.0001)).toBe('0.0001');
  });

  it('conserva los valores grandes', () => {
    expect(pipe.transform(1e12)).toBe('1000000000000');
  });

  it('muestra un guion cuando el valor no es finito', () => {
    expect(pipe.transform(Number.NaN)).toBe('—');
    expect(pipe.transform(Number.POSITIVE_INFINITY)).toBe('—');
  });
});
