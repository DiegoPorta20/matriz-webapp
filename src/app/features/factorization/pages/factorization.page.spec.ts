import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { apiErrorInterceptor } from '../../../core/http/api-error.interceptor';
import { FactorizationPage } from './factorization.page';

const successBody = {
  success: true,
  data: {
    original: [[1, 2], [3, 4]],
    q: [[1, 0], [0, 1]],
    r: [[5, 6], [0, 7]],
    statistics: {
      q: { max: 1, min: 0, average: 0.5, sum: 2, isDiagonal: true },
      r: { max: 7, min: 0, average: 4.5, sum: 18, isDiagonal: false },
    },
  },
  message: 'Matrix processed successfully',
  timestamp: '2026-07-30T12:00:00Z',
};

describe('FactorizationPage', () => {
  let fixture: ComponentFixture<FactorizationPage>;
  let component: FactorizationPage;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactorizationPage],
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: (): Promise<boolean> => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FactorizationPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('empieza sin resultado, sin error y sin cargar', () => {
    expect(component.result()).toBeNull();
    expect(component.error()).toBeNull();
    expect(component.isLoading()).toBe(false);
  });

  it('marca la carga mientras espera la respuesta', () => {
    component.factorize([[1, 2], [3, 4]]);

    expect(component.isLoading()).toBe(true);

    httpMock.expectOne('/api/v1/factorization').flush(successBody);

    expect(component.isLoading()).toBe(false);
  });

  it('publica el resultado que devuelve la API', () => {
    component.factorize([[1, 2], [3, 4]]);
    httpMock.expectOne('/api/v1/factorization').flush(successBody);

    expect(component.result()?.q).toEqual([[1, 0], [0, 1]]);
    expect(component.result()?.statistics.r.sum).toBe(18);
    expect(component.error()).toBeNull();
  });

  it('expone el error con sus detalles', () => {
    component.factorize([[1, 2], [3]]);
    httpMock.expectOne('/api/v1/factorization').flush(
      {
        success: false,
        message: 'Invalid matrix',
        errors: ['All matrix rows must have 2 columns, but row 2 has 1'],
        timestamp: '2026-07-30T12:00:00Z',
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(component.error()?.message).toBe('Invalid matrix');
    expect(component.error()?.details.length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('descarta el resultado anterior cuando la petición falla', () => {
    component.factorize([[1, 2], [3, 4]]);
    httpMock.expectOne('/api/v1/factorization').flush(successBody);
    expect(component.result()).not.toBeNull();

    component.factorize([[1, 2], [3]]);
    httpMock
      .expectOne('/api/v1/factorization')
      .flush({ success: false, message: 'Invalid matrix', errors: [] }, { status: 422, statusText: 'x' });

    expect(component.result()).toBeNull();
  });

  it('limpia el error al reintentar con éxito', () => {
    component.factorize([[1, 2], [3]]);
    httpMock
      .expectOne('/api/v1/factorization')
      .flush({ success: false, message: 'Invalid matrix', errors: [] }, { status: 422, statusText: 'x' });
    expect(component.error()).not.toBeNull();

    component.factorize([[1, 2], [3, 4]]);
    httpMock.expectOne('/api/v1/factorization').flush(successBody);

    expect(component.error()).toBeNull();
    expect(component.result()).not.toBeNull();
  });
});
