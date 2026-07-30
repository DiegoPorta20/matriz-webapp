import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { FactorizationResult } from '../models/factorization.model';
import { FactorizationApiService } from './factorization-api.service';

describe('FactorizationApiService', () => {
  let service: FactorizationApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FactorizationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('envía la matriz en el campo que espera go-api', () => {
    service.factorize([[1, 2], [3, 4]]).subscribe();

    const request = httpMock.expectOne('/api/v1/factorization');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ matrix: [[1, 2], [3, 4]] });

    request.flush(successResponse());
  });

  it('desenvuelve la respuesta y entrega solo los datos', () => {
    let received: FactorizationResult | undefined;
    service.factorize([[1]]).subscribe((result) => {
      received = result;
    });

    httpMock.expectOne('/api/v1/factorization').flush(successResponse());

    expect(received?.original).toEqual([[1, 2], [3, 4]]);
    expect(received?.statistics.q.isDiagonal).toBe(true);
  });

  const successResponse = (): object => ({
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
  });
});
