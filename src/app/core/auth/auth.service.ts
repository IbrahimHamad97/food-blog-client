/**
 * Session state: Google sign-in via API, JWT in localStorage, restore on load.
 */
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AUTH_TOKEN_KEY, AuthResponse, AuthUser, MeResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly loadingSignal = signal(false);

  readonly currentUser = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  /** Called at app startup — restores session from stored JWT if valid. */
  async loadSession(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = this.getToken();
    if (!token) {
      return;
    }

    this.loadingSignal.set(true);
    try {
      const { user } = await firstValueFrom(
        this.http.get<MeResponse>(`${environment.apiBaseUrl}/auth/me`),
      );
      this.userSignal.set(user);
    } catch {
      this.clearToken();
      this.userSignal.set(null);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sends Google ID token to the API; stores JWT and user on success.
   * Called from the sign-in page GIS callback.
   */
  async signInWithGoogleIdToken(idToken: string): Promise<void> {
    const { token, user } = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/google`, { idToken }),
    );
    this.persistToken(token);
    this.userSignal.set(user);
  }

  /** Updates the public display name and refreshes local session user. */
  async updateDisplayName(name: string): Promise<AuthUser> {
    const { user } = await firstValueFrom(
      this.http.patch<MeResponse>(`${environment.apiBaseUrl}/auth/me`, { name }),
    );
    this.userSignal.set(user);
    return user;
  }

  /** Clears local session and notifies API (best-effort). */
  async signOut(): Promise<void> {
    const token = this.getToken();
    this.clearToken();
    this.userSignal.set(null);

    if (token && isPlatformBrowser(this.platformId)) {
      try {
        await firstValueFrom(
          this.http.post(`${environment.apiBaseUrl}/auth/logout`, {}),
        );
      } catch {
        // logout is stateless; ignore network errors
      }
    }
  }

  /** JWT for the auth interceptor — null when signed out. */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private persistToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  }

  private clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
}
