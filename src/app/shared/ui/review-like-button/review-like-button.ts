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
  /** Server-provided liked state for the current viewer. */
  readonly likedByMe = input(false);
  /** Smaller padding and icon on feed cards. */
  readonly compact = input(false);

  protected readonly busy = signal(false);

  /** Live like count — session override wins over the server-provided input. */
  protected readonly count = computed(() => {
    this.likes.overridesMap();
    return this.likes.getState(this.reviewId(), this.likedByMe(), this.likeCount()).likeCount;
  });

  protected readonly liked = computed(() => {
    this.likes.overridesMap();
    return this.likes.getState(this.reviewId(), this.likedByMe(), this.likeCount()).liked;
  });

  protected readonly isAuthenticated = this.auth.isAuthenticated;

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
      await this.likes.toggle(this.reviewId(), this.liked(), this.count(), this.authorId());
    } catch {
      // State is reverted inside the service; nothing else to do here.
    } finally {
      this.busy.set(false);
    }
  }
}
