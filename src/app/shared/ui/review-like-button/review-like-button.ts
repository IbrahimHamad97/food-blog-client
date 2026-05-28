/**
 * Like control for a review — heart + count; uses mock {@link ReviewLikesService}.
 */
import { Component, computed, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ReviewLikesService } from '../../../core/engagement/review-likes.service';

@Component({
  selector: 'app-review-like-button',
  templateUrl: './review-like-button.html',
  styleUrl: './review-like-button.css',
})
export class ReviewLikeButton {
  private readonly likes = inject(ReviewLikesService);
  private readonly auth = inject(AuthService);

  readonly reviewId = input.required<string>();
  /** Review author — when omitted, own-review detection is skipped until bound. */
  readonly authorId = input<string>();
  readonly likeCount = input.required<number>();
  /** Smaller padding and icon on feed cards. */
  readonly compact = input(false);

  protected readonly busy = signal(false);

  protected readonly liked = computed(() => {
    this.likes.likedIds();
    return this.likes.isLiked(this.reviewId());
  });

  protected readonly canLike = this.likes.isAuthenticated;

  protected readonly isOwnReview = computed(() => {
    const authorId = this.authorId();
    if (!authorId) {
      return false;
    }
    const user = this.auth.currentUser();
    return !!user && user.id === authorId;
  });

  protected async onClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOwnReview() || this.busy()) {
      return;
    }

    this.busy.set(true);
    try {
      await this.likes.toggleLike(this.reviewId(), this.authorId());
    } finally {
      this.busy.set(false);
    }
  }
}
