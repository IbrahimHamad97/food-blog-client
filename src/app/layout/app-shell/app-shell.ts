/**
 * Application layout shell — wraps every page with header and footer.
 *
 * `<router-outlet>` is where Angular inserts the active route's component
 * (e.g. home page). This file does not use `inject()` because it has no services yet.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

/**
 * Layout host: `<app-app-shell>`.
 *
 * `imports` — standalone components used in `app-shell.html`.
 * `templateUrl` / `styleUrl` — external HTML and CSS for this component.
 */
@Component({
  selector: 'app-app-shell',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {}
