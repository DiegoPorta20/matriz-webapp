import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { API_BASE_PATH } from '../config/api.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('empieza sin autenticar', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('guarda el token que devuelve la API', () => {
    service.login({ username: 'demo', password: 'secret' }).subscribe();

    const request = httpMock.expectOne(`${API_BASE_PATH}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'demo', password: 'secret' });

    request.flush({
      success: true,
      data: { accessToken: 'signed-token', tokenType: 'Bearer', expiresIn: 3600 },
      message: 'ok',
      timestamp: '2026-07-30T12:00:00Z',
    });

    expect(service.accessToken()).toBe('signed-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('olvida el token al cerrar sesión', () => {
    sessionStorage.setItem('qr.accessToken', 'stored-token');
    service = TestBed.inject(AuthService);

    service.logout();

    expect(service.accessToken()).toBeNull();
    expect(sessionStorage.getItem('qr.accessToken')).toBeNull();
  });

  it('recupera el token de sessionStorage al construirse', () => {
    sessionStorage.setItem('qr.accessToken', 'previous-token');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const restored = TestBed.inject(AuthService);
    expect(restored.accessToken()).toBe('previous-token');

    TestBed.inject(HttpTestingController).verify();
  });
});
