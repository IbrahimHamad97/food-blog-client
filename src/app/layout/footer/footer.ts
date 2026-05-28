/**
 * Site footer — secondary navigation and copyright.
 */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** One link in the footer nav (label + router path). */
interface FooterLink {
  label: string;
  path: string;
}

/**
 * Footer host: `<app-footer>`.
 *
 * `RouterLink` in `imports` allows `[routerLink]` on `<a>` in the template
 * without declaring the footer as part of a separate NgModule.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  /** Current calendar year for the copyright line (evaluated when the component loads). */
  protected readonly year = new Date().getFullYear();

  /**
   * Footer navigation entries.
   * `protected` — readable in `footer.html`; not part of the public API outside this class.
   */
  protected readonly footerLinks: FooterLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/collections' },
  ];
}
