import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { API_BASE_PATH } from '../../../core/config/api.config';
import type { ApiSuccessResponse } from '../../../core/models/api-response.model';
import type { FactorizationResult } from '../models/factorization.model';

@Injectable({ providedIn: 'root' })
export class FactorizationApiService {
  private readonly http = inject(HttpClient);

  factorize(matrix: readonly number[][]): Observable<FactorizationResult> {
    return this.http
      .post<ApiSuccessResponse<FactorizationResult>>(`${API_BASE_PATH}/factorization`, { matrix })
      .pipe(map((response) => response.data));
  }
}
