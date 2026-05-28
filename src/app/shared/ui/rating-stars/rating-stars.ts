/**
 * Read-only star rating display (1–5). Used on review cards and detail pages.
 */
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  template: `
    <span class="stars" [attr.aria-label]="ariaLabel()">
      @for (star of stars(); track $index) {
        <svg
          class="stars__icon"
          [class.stars__icon--filled]="star === 'full'"
          [class.stars__icon--empty]="star === 'empty'"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          />
        </svg>
      }
    </span>
  `,
  styleUrl: './rating-stars.css',
})
export class RatingStars {
  /** Rating value clamped to 1–5 in {@link stars}. */
  readonly rating = input.required<number>();

  readonly stars = computed(() => {
    const value = Math.min(5, Math.max(0, Math.round(this.rating())));
    return Array.from({ length: 5 }, (_, i) => (i < value ? 'full' : 'empty'));
  });

  readonly ariaLabel = computed(() => `${this.rating()} out of 5 stars`);
}
