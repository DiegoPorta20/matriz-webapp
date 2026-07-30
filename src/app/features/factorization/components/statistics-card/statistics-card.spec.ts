import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { MatrixStatistics } from '../../models/factorization.model';
import { StatisticsCardComponent } from './statistics-card';

const statistics = (overrides: Partial<MatrixStatistics> = {}): MatrixStatistics => ({
  max: 0.3162,
  min: -0.9487,
  average: -0.4743,
  sum: -1.8974,
  isDiagonal: false,
  ...overrides,
});

describe('StatisticsCardComponent', () => {
  let fixture: ComponentFixture<StatisticsCardComponent>;

  const render = (value: MatrixStatistics): void => {
    fixture.componentRef.setInput('title', 'Estadísticas de Q');
    fixture.componentRef.setInput('statistics', value);
    fixture.detectChanges();
  };

  const items = (): { label: string; value: string }[] =>
    Array.from(
      fixture.nativeElement.querySelectorAll('.statistics__item') as NodeListOf<HTMLElement>,
    ).map((item) => ({
      label: (item.querySelector('dt')?.textContent ?? '').trim(),
      value: (item.querySelector('dd')?.textContent ?? '').trim(),
    }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatisticsCardComponent);
  });

  it('muestra las cinco estadisticas del contrato', () => {
    render(statistics());

    expect(items().map((i) => i.label)).toEqual([
      'Máximo',
      'Mínimo',
      'Promedio',
      'Suma',
      'Diagonal',
    ]);
  });

  it('formatea los valores con el pipe', () => {
    render(statistics({ max: 1e-17, sum: 2.5 }));

    const byLabel = new Map(items().map((i) => [i.label, i.value]));
    expect(byLabel.get('Máximo')).toBe('0');
    expect(byLabel.get('Suma')).toBe('2.5');
  });

  it('dice Sí cuando la matriz es diagonal', () => {
    render(statistics({ isDiagonal: true }));

    expect(items().at(-1)?.value).toContain('Sí');
  });

  it('dice No cuando no lo es', () => {
    render(statistics({ isDiagonal: false }));

    expect(items().at(-1)?.value).toContain('No');
  });

  it('acompana el icono con texto, no solo con color', () => {
    render(statistics({ isDiagonal: true }));

    const diagonal = fixture.nativeElement.querySelector('.statistics__diagonal') as HTMLElement;
    expect(diagonal.querySelector('mat-icon')).not.toBeNull();
    expect((diagonal.querySelector('span')?.textContent ?? '').trim()).toBe('Sí');
  });

  it('muestra el titulo que recibe', () => {
    render(statistics());

    expect((fixture.nativeElement.textContent as string) || '').toContain('Estadísticas de Q');
  });
});
