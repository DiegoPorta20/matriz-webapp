import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';
import type { ApiError } from '../models/api-response.model';
import { apiErrorInterceptor } from './api-error.interceptor';

describe('authInterceptor y apiErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let navigateSpy: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.clear();

    navigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('no añade Authorization cuando no hay sesión', () => {
    http.get('/api/v1/anything').subscribe();

    expect(httpMock.expectOne('/api/v1/anything').request.headers.has('Authorization')).toBe(false);
  });

  it('añade el token a las peticiones cuando hay sesión', () => {
    givenAuthenticated('signed-token');

    http.get('/api/v1/anything').subscribe();

    const request = httpMock.expectOne('/api/v1/anything');
    expect(request.request.headers.get('Authorization')).toBe('Bearer signed-token');
  });

  it('normaliza el envoltorio de error de la API', () => {
    let captured: ApiError | undefined;
    http.post('/api/v1/factorization', {}).subscribe({
      error: (error: ApiError) => {
        captured = error;
      },
    });

    httpMock.expectOne('/api/v1/factorization').flush(
      {
        success: false,
        message: 'Invalid matrix',
        errors: ['All matrix rows must have 2 columns'],
        timestamp: '2026-07-30T12:00:00Z',
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(captured?.status).toBe(422);
    expect(captured?.message).toBe('Invalid matrix');
    expect(captured?.details).toEqual(['All matrix rows must have 2 columns']);
  });

  it('da un mensaje legible cuando el servidor no responde', () => {
    let captured: ApiError | undefined;
    http.get('/api/v1/anything').subscribe({
      error: (error: ApiError) => {
        captured = error;
      },
    });

    httpMock.expectOne('/api/v1/anything').error(new ProgressEvent('error'), { status: 0 });

    expect(captured?.status).toBe(0);
    expect(captured?.message).toContain('conexión');
  });

  it('no filtra detalles internos cuando el error no trae el envoltorio', () => {
    let captured: ApiError | undefined;
    http.get('/api/v1/anything').subscribe({
      error: (error: ApiError) => {
        captured = error;
      },
    });

    httpMock
      .expectOne('/api/v1/anything')
      .flush('<html>nginx internal error at /usr/share/nginx</html>', {
        status: 500,
        statusText: 'Internal Server Error',
      });

    expect(captured?.message).toBe('Ha ocurrido un error inesperado.');
    expect(captured?.message).not.toContain('nginx');
  });

  it('cierra la sesión y lleva al login cuando la API responde 401', () => {
    givenAuthenticated('expired-token');

    http.get('/api/v1/factorization').subscribe({ error: () => undefined });

    httpMock
      .expectOne('/api/v1/factorization')
      .flush(
        { success: false, message: 'Access token is invalid or has expired', errors: [] },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(authService.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('no cierra sesion ni redirige cuando el 401 viene del propio login', () => {
    http.post('/api/v1/auth/login', { username: 'demo', password: 'wrong' }).subscribe({
      error: () => undefined,
    });

    httpMock
      .expectOne('/api/v1/auth/login')
      .flush(
        { success: false, message: 'Invalid username or password', errors: [] },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  const givenAuthenticated = (token: string): void => {
    authService.login({ username: 'demo', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/v1/auth/login').flush({
      success: true,
      data: { accessToken: token, tokenType: 'Bearer', expiresIn: 3600 },
      message: 'ok',
      timestamp: '2026-07-30T12:00:00Z',
    });
  };
});
