/**
 * Review tile for home feed and carousels — image, title, place, rating, author.
 */
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Review } from '../../../core/models/review.model';
import { reviewDisplayTags, serviceTypeLabel } from '../../../core/utils/review.utils';
import { RatingStars } from '../rating-stars/rating-stars';
import { ReviewLikeButton } from '../review-like-button/review-like-button';
import { ReviewBookmarkButton } from '../review-bookmark-button/review-bookmark-button';
import { UserAvatar } from '../user-avatar/user-avatar';

/** Shown on cards when a review has no uploaded photos. */
const PLACEHOLDER_IMAGE = '/Temmie.png';

@Component({
  selector: 'app-review-card',
  imports: [RouterLink, RatingStars, DatePipe, ReviewLikeButton, ReviewBookmarkButton, UserAvatar],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
  host: {
    '[class.review-card-host--carousel]': 'layout() === "carousel"',
    '[class.review-card-host--grid]': 'layout() === "grid"',
  },
})
export class ReviewCard {
  private readonly router = inject(Router);

  readonly review = input.required<Review>();

  /**
   * `carousel` — fixed width in horizontal scroll.
   * `grid` — fills grid cell (default).
   */
  readonly layout = input<'grid' | 'carousel'>('grid');

  /** True when the card shows the Temmie placeholder instead of a real photo. */
  protected readonly usingPlaceholder = computed(() => this.review().imageUrls.length === 0);

  /** Cover URL — first review photo, or Temmie when none were uploaded. */
  protected readonly coverImage = computed(
    () => this.review().imageUrls[0] ?? PLACEHOLDER_IMAGE,
  );

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

  /** Author chip is nested inside the card link — navigate without opening the review. */
  protected goToAuthor(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    void this.router.navigate(['/users', this.review().author.id]);
  }
}
