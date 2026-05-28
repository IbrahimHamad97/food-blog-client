/**
 * @deprecated Replaced by {@link AuthService}. Kept temporarily for reference; not used in app.
 */
import { Injectable, computed, signal } from '@angular/core';

/** Shape of the user object shown in the header menu (subset of a future API user). */
export interface MockUser {
  id: string;
  name: string;
  avatarUrl: string;
}

/** Fixed demo user returned by {@link MockAuthService.signIn}. */
const DEMO_USER: MockUser = {
  id: 'demo-1',
  name: 'Alex Rivera',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

/**
 * In-memory auth stub — `providedIn: 'root'` registers one app-wide instance.
 *
 * No `inject()` here yet; state is held in private {@link userSignal}.
 */
@Injectable({ providedIn: 'root' })
export class MockAuthService {
  /** Internal writable state; `null` means signed out. */
  private readonly userSignal = signal<MockUser | null>(null);

  /**
   * Read-only view for templates — they can read `currentUser()` but not `.set()`.
   * `asReadonly()` prevents accidental writes from components.
   */
  readonly currentUser = this.userSignal.asReadonly();

  /** True when {@link currentUser} is not `null`. Used for `*if` in the header template. */
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  /** Pretend Google sign-in succeeded — sets the demo user. */
  signIn(): void {
    this.userSignal.set(DEMO_USER);
  }

  /** Clears session — shows the Sign in button again. */
  signOut(): void {
    this.userSignal.set(null);
  }
}
