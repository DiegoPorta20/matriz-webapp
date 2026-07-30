import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import type { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { API_BASE_PATH } from '../config/api.config';
import type { ApiError, ApiErrorResponse } from '../models/api-response.model';

const NETWORK_ERROR_MESSAGE = 'No se pudo contactar con el servidor. Revisa tu conexión.';
const UNKNOWN_ERROR_MESSAGE = 'Ha ocurrido un error inesperado.';

const LOGIN_PATH = `${API_BASE_PATH}/auth/login`;

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);
      if (apiError.status === 401 && !isLoginRequest(request.url)) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => apiError);
    }),
  );
};

const isLoginRequest = (url: string): boolean => url.endsWith(LOGIN_PATH);

const toApiError = (error: unknown): ApiError => {
  if (!(error instanceof HttpErrorResponse)) {
    return { status: 0, message: UNKNOWN_ERROR_MESSAGE, details: [] };
  }

  if (error.status === 0) {
    return { status: 0, message: NETWORK_ERROR_MESSAGE, details: [] };
  }

  const body = error.error as ApiErrorResponse | null;
  if (body !== null && typeof body === 'object' && typeof body.message === 'string') {
    return {
      status: error.status,
      message: body.message,
      details: Array.isArray(body.errors) ? body.errors : [],
    };
  }

  return { status: error.status, message: UNKNOWN_ERROR_MESSAGE, details: [] };
};
