import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

import { API_BASE_PATH } from '../config/api.config';
import type { ApiSuccessResponse } from '../models/api-response.model';

interface AccessTokenDto {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresIn: number;
}

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

const STORAGE_KEY = 'qr.accessToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(sessionStorage.getItem(STORAGE_KEY));

  readonly accessToken = this.token.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(credentials: Credentials): Observable<void> {
    return this.http
      .post<ApiSuccessResponse<AccessTokenDto>>(`${API_BASE_PATH}/auth/login`, credentials)
      .pipe(
        map((response) => {
          this.storeToken(response.data.accessToken);
        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.token.set(null);
  }

  private storeToken(accessToken: string): void {
    sessionStorage.setItem(STORAGE_KEY, accessToken);
    this.token.set(accessToken);
  }
}
