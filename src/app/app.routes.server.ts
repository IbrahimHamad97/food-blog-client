/**
 * SSR route rendering modes.
 */
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'sign-in', renderMode: RenderMode.Client },
  { path: 'me', renderMode: RenderMode.Client },
  { path: 'reviews/new', renderMode: RenderMode.Client },
  { path: 'reviews/:id/edit', renderMode: RenderMode.Client },
  { path: 'reviews/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
