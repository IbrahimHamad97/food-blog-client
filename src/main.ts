/**
 * Browser entry point — boots the Angular app when the page loads.
 *
 * `bootstrapApplication` mounts the root {@link App} component on `<app-root>`
 * and wires up providers from {@link appConfig} (router, theme init, hydration).
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
