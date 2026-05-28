/**
 * Theme state — light/dark mode for the whole app.
 *
 * CSS in `styles.css` reads `html[data-theme="light|dark"]`. This service keeps
 * that attribute, `color-scheme`, and an in-memory {@link theme} signal in sync.
 */
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

/** Allowed theme values stored in the DOM and localStorage. */
export type ThemeMode = 'light' | 'dark';

/** `localStorage` key written when the user clicks the header theme toggle. */
export const THEME_STORAGE_KEY = 'food-blog-theme';

/**
 * Singleton theme service (`providedIn: 'root'` → one instance for the whole app).
 *
 * **Why `inject(PLATFORM_ID)`?**
 * Angular can run this code on the server (SSR) where `window` and `localStorage` do not exist.
 * `PLATFORM_ID` tells us `browser` vs `server` so we skip DOM access during SSR.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Injected token — not a class we wrote; supplied by Angular's platform layer. */
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Reactive current theme. Templates/services call `theme()` to read, `.set()` to write.
   * {@link https://angular.dev/guide/signals | Signals} trigger UI updates when the value changes.
   */
  readonly theme = signal<ThemeMode>('light');

  /**
   * Derived flag: true when {@link theme} is `'dark'`.
   * `computed` recalculates automatically when `theme` changes (used by the header icon).
   */
  readonly isDark = computed(() => this.theme() === 'dark');

  /**
   * Called once at startup from {@link app.config} `provideAppInitializer`.
   * Restores saved preference, or matches the OS, without writing to localStorage yet.
   */
  initFromStorageOrSystem(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      this.applyTheme(stored, false);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(prefersDark ? 'dark' : 'light', false);
  }

  /** User clicked the theme button — flip mode and persist the choice. */
  toggleTheme(): void {
    const next: ThemeMode = this.theme() === 'light' ? 'dark' : 'light';
    this.applyTheme(next, true);
  }

  /**
   * Applies theme to the Angular signal and the live document.
   *
   * @param mode - `'light'` or `'dark'`
   * @param persist - If true, save to `localStorage` (explicit user choice)
   */
  private applyTheme(mode: ThemeMode, persist: boolean): void {
    this.theme.set(mode);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;

    if (persist) {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  }
}
