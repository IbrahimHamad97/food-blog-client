/**
 * Collections browse stub — collections are user-owned lists visible on profiles in v1.
 */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-collections-browse-page',
  imports: [RouterLink],
  template: `
    <section class="stub">
      <h1 class="stub__title">Collections</h1>
      <p class="stub__text">
        Collections are personal lists (for example “Chinese food”) that each user creates and
        adds their reviews to. In this version they appear on a user’s profile when you visit it —
        not as a site-wide browse page yet.
      </p>
      <a routerLink="/" class="stub__link">Back to home</a>
    </section>
  `,
  styles: `
    .stub__title {
      margin: 0 0 1rem;
      font-size: 1.75rem;
      font-weight: 800;
    }
    .stub__text {
      max-width: 36rem;
      color: var(--color-muted);
      line-height: 1.6;
    }
    .stub__link {
      display: inline-block;
      margin-top: 1.5rem;
      font-weight: 600;
      color: var(--color-accent);
    }
  `,
})
export class CollectionsBrowsePage {}
