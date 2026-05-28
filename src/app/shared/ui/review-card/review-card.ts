/**
 * Review tile for home feed and carousels — image, title, place, rating, author.
 */
import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Review } from '../../../core/models/review.model';
import { reviewDisplayTags, serviceTypeLabel } from '../../../core/utils/review.utils';
import { RatingStars } from '../rating-stars/rating-stars';
import { ReviewLikeButton } from '../review-like-button/review-like-button';

@Component({
  selector: 'app-review-card',
  imports: [RouterLink, RatingStars, DatePipe, ReviewLikeButton],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
  host: {
    '[class.review-card-host--carousel]': 'layout() === "carousel"',
    '[class.review-card-host--grid]': 'layout() === "grid"',
  },
})
export class ReviewCard {
  readonly review = input.required<Review>();

  /**
   * `carousel` — fixed width in horizontal scroll.
   * `grid` — fills grid cell (default).
   */
  readonly layout = input<'grid' | 'carousel'>('grid');

  /** First uploaded photo for the card cover, if any. */
  protected readonly coverImage = computed(() => this.review().imageUrls[0] ?? null);

  protected serviceLabel(): string {
    return serviceTypeLabel(this.review().serviceType);
  }

  /** Kept for stale HMR bundles that still call the old template name. */
  protected visitSubtitle(): string {
    return this.serviceLabel();
  }

  protected shownTags(): string[] {
    return reviewDisplayTags(this.review()).slice(0, 2);
  }

  protected moreTagCount(): number {
    return Math.max(0, reviewDisplayTags(this.review()).length - 2);
  }
}
