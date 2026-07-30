import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const run = (): boolean | ReturnType<Router['createUrlTree']> =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as boolean | ReturnType<Router['createUrlTree']>;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('deja pasar cuando hay sesión', () => {
    sessionStorage.setItem('qr.accessToken', 'signed-token');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);

    expect(run()).toBe(true);
  });

  it('redirige al login cuando no hay sesión', () => {
    const result = run();

    expect(result).not.toBe(true);
    expect(String(result)).toContain('/login');
  });
});
