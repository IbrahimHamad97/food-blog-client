/**
 * Server-side (SSR) providers — merged with {@link app.config} for Node rendering.
 *
 * Used when Express serves the app via `main.server.ts`; not loaded in the browser-only bundle.
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/** Extra providers for SSR; combined with browser `appConfig` into `config`. */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

/** Full config used by the Angular SSR engine on the server. */
export const config = mergeApplicationConfig(appConfig, serverConfig);
