/**
 * Root component — the only component bootstrapped directly from `main.ts`.
 *
 * Keeps the root minimal: all visible chrome (header, footer, pages) lives in
 * {@link AppShell} so this file stays easy to find but rarely needs edits.
 */
import { Component } from '@angular/core';
import { AppShell } from './layout/app-shell/app-shell';

/**
 * Host element: `<app-root>` in `index.html`.
 *
 * `imports` lists standalone child components this template may use.
 * `template` is inline here because it is a single tag.
 */
@Component({
  selector: 'app-root',
  imports: [AppShell],
  template: '<app-app-shell />',
})
export class App {}
