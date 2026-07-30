import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixViewComponent } from './matrix-view';

describe('MatrixViewComponent', () => {
  let fixture: ComponentFixture<MatrixViewComponent>;

  const render = (title: string, matrix: number[][], description = ''): void => {
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('matrix', matrix);
    fixture.componentRef.setInput('description', description);
    fixture.detectChanges();
  };

  const cells = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('td') as NodeListOf<HTMLElement>).map((td) =>
      (td.textContent ?? '').trim(),
    );

  const text = (selector: string): string =>
    (
      (fixture.nativeElement.querySelector(selector) as HTMLElement | null)?.textContent ?? ''
    ).trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MatrixViewComponent] }).compileComponents();
    fixture = TestBed.createComponent(MatrixViewComponent);
  });

  it('renderiza una celda por valor', () => {
    render('Q', [
      [1, 2],
      [3, 4],
    ]);

    expect(cells()).toEqual(['1', '2', '3', '4']);
  });

  it('muestra el titulo y las dimensiones', () => {
    render('Q', [
      [1, 2, 3],
      [4, 5, 6],
    ]);

    expect(text('.matrix__title')).toBe('Q');
    expect(text('.matrix__dimensions')).toBe('2 × 3');
  });

  it('aplica el formato del pipe a los residuos de punto flotante', () => {
    render('R', [
      [-3.16227766, 1e-17],
      [0, 2.5],
    ]);

    expect(cells()).toEqual(['-3.1623', '0', '0', '2.5']);
  });

  it('omite la descripcion cuando no se le pasa ninguna', () => {
    render('Q', [[1]]);

    expect(fixture.nativeElement.querySelector('.matrix__description')).toBeNull();
  });

  it('muestra la descripcion cuando se le pasa', () => {
    render('Q', [[1]], 'Matriz ortogonal');

    expect(text('.matrix__description')).toBe('Matriz ortogonal');
  });

  it('describe la tabla para lectores de pantalla', () => {
    render('R', [[1, 2]]);

    expect(text('caption')).toContain('R');
    expect(text('caption')).toContain('1 × 2');
  });

  it('no falla con una matriz vacia', () => {
    render('Q', []);

    expect(cells()).toEqual([]);
    expect(text('.matrix__dimensions')).toBe('0 × 0');
  });

  it('renderiza una matriz de una sola columna', () => {
    render('Q', [[1], [2], [3]]);

    expect(cells()).toEqual(['1', '2', '3']);
    expect(text('.matrix__dimensions')).toBe('3 × 1');
  });
});
