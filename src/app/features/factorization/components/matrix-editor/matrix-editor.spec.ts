import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixEditorComponent } from './matrix-editor';

describe('MatrixEditorComponent', () => {
  let fixture: ComponentFixture<MatrixEditorComponent>;
  let component: MatrixEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatrixEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const dimensions = (): string => `${String(component.rows())}x${String(component.columns())}`;

  it('empieza con una matriz de ejemplo utilizable', () => {
    expect(dimensions()).toBe('2x2');
    expect(component.form.valid).toBe(true);
  });

  it('añade una fila con ceros manteniendo el número de columnas', () => {
    component.addRow();

    expect(dimensions()).toBe('3x2');
    expect(component.grid.at(2).length).toBe(2);
    expect(component.grid.at(2).at(0).value).toBe(0);
  });

  it('añade una columna a todas las filas', () => {
    component.addRow();
    component.addColumn();

    expect(dimensions()).toBe('3x3');
    component.grid.controls.forEach((row) => {
      expect(row.length).toBe(3);
    });
  });

  it('elimina la última fila', () => {
    component.addRow();
    component.removeRow();

    expect(dimensions()).toBe('2x2');
  });

  it('elimina una columna de todas las filas', () => {
    component.removeColumn();

    expect(dimensions()).toBe('2x1');
    component.grid.controls.forEach((row) => {
      expect(row.length).toBe(1);
    });
  });

  it('no permite añadir una columna si igualaría el número de filas', () => {
    expect(component.canAddColumn()).toBe(false);

    component.addColumn();

    expect(dimensions()).toBe('2x2');
  });

  it('permite añadir una columna después de añadir una fila', () => {
    component.addRow();

    expect(component.canAddColumn()).toBe(true);
  });

  it('no permite eliminar una fila si dejaría más columnas que filas', () => {
    expect(component.canRemoveRow()).toBe(false);

    component.removeRow();

    expect(dimensions()).toBe('2x2');
  });

  it('no permite eliminar la última columna', () => {
    component.removeColumn();

    expect(component.canRemoveColumn()).toBe(false);

    component.removeColumn();

    expect(dimensions()).toBe('2x1');
  });

  it('emite la matriz que el usuario ha compuesto', () => {
    const emitted: number[][][] = [];
    component.factorize.subscribe((matrix) => {
      emitted.push(matrix);
    });

    component.grid.at(0).at(0).setValue(9.5);
    component.submit();

    expect(emitted).toEqual([[[9.5, 2], [3, 4]]]);
  });

  it('no emite nada cuando una celda está vacía', () => {
    const emitted: number[][][] = [];
    component.factorize.subscribe((matrix) => {
      emitted.push(matrix);
    });

    component.grid.at(0).at(0).setValue(null);
    component.submit();

    expect(emitted).toEqual([]);
    expect(component.form.touched).toBe(true);
  });
});
