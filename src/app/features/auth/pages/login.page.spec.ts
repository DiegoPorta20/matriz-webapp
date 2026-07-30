import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorInterceptor } from '../../../core/http/api-error.interceptor';
import { LoginPage } from './login.page';
import { API_BASE_PATH } from '../../../core/config/api.config';

const tokenResponse = {
  success: true,
  data: { accessToken: 'signed-token', tokenType: 'Bearer', expiresIn: 3600 },
  message: 'Authentication successful',
  timestamp: '2026-07-30T12:00:00Z',
};

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let httpMock: HttpTestingController;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    sessionStorage.clear();
    navigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  const fillForm = (username: string, password: string): void => {
    component.form.setValue({ username, password });
  };

  it('empieza con el formulario invalido y sin error', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.errorMessage()).toBeNull();
    expect(component.isSubmitting()).toBe(false);
  });

  it('no llama a la API con el formulario vacio', () => {
    component.submit();

    httpMock.expectNone(`${API_BASE_PATH}/auth/login`);
    expect(component.form.touched).toBe(true);
  });

  it('no llama a la API si falta la contrasena', () => {
    fillForm('demo', '');

    component.submit();

    httpMock.expectNone(`${API_BASE_PATH}/auth/login`);
    expect(component.isSubmitting()).toBe(false);
  });

  it('envia las credenciales y navega al entrar', () => {
    fillForm('demo', 'secret');

    component.submit();

    const request = httpMock.expectOne(`${API_BASE_PATH}/auth/login`);
    expect(request.request.body).toEqual({ username: 'demo', password: 'secret' });
    request.flush(tokenResponse);

    expect(navigateSpy).toHaveBeenCalledWith(['/factorization']);
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
  });

  it('muestra el mensaje de la API cuando las credenciales son invalidas', () => {
    fillForm('demo', 'wrong');

    component.submit();

    httpMock
      .expectOne(`${API_BASE_PATH}/auth/login`)
      .flush(
        { success: false, message: 'Invalid username or password', errors: [] },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(component.errorMessage()).toBe('Invalid username or password');
    expect(component.isSubmitting()).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('avisa cuando no hay servidor al que conectarse', () => {
    fillForm('demo', 'secret');

    component.submit();

    httpMock.expectOne(`${API_BASE_PATH}/auth/login`).error(new ProgressEvent('error'), { status: 0 });

    expect(component.errorMessage()).toContain('conexión');
  });

  it('marca el envio en curso mientras espera', () => {
    fillForm('demo', 'secret');

    component.submit();
    expect(component.isSubmitting()).toBe(true);

    httpMock.expectOne(`${API_BASE_PATH}/auth/login`).flush(tokenResponse);
  });

  it('ignora un segundo envio mientras el primero esta en vuelo', () => {
    fillForm('demo', 'secret');

    component.submit();
    component.submit();

    httpMock.expectOne(`${API_BASE_PATH}/auth/login`).flush(tokenResponse);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('limpia el error anterior al reintentar', () => {
    fillForm('demo', 'wrong');
    component.submit();
    httpMock
      .expectOne(`${API_BASE_PATH}/auth/login`)
      .flush({ success: false, message: 'Invalid username or password', errors: [] }, { status: 401, statusText: 'x' });
    expect(component.errorMessage()).not.toBeNull();

    fillForm('demo', 'secret');
    component.submit();

    expect(component.errorMessage()).toBeNull();
    httpMock.expectOne(`${API_BASE_PATH}/auth/login`).flush(tokenResponse);
  });
});
