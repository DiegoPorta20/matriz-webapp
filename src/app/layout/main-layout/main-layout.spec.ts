import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  let fixture: ComponentFixture<MainLayout>;
  let component: MainLayout;
  let authService: AuthService;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    sessionStorage.setItem('qr.accessToken', 'signed-token');
    navigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('ofrece salir de la sesion', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect((button.textContent ?? '').trim()).toContain('Salir');
  });

  it('cierra la sesion y vuelve al login', () => {
    expect(authService.isAuthenticated()).toBe(true);

    component.logout();

    expect(authService.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('qr.accessToken')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('cierra la sesion al pulsar el boton', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.click();

    expect(authService.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
