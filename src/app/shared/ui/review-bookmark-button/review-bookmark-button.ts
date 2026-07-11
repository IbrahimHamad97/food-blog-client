/**
 * Bookmark toggle — hidden on the viewer's own reviews.
 */
import { Component, computed, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ReviewBookmarksService } from '../../../core/engagement/review-bookmarks.service';

@Component({
  selector: 'app-review-bookmark-button',
  templateUrl: './review-bookmark-button.html',
  styleUrl: './review-bookmark-button.css',
})
export class ReviewBookmarkButton {
  private readonly bookmarks = inject(ReviewBookmarksService);
  private readonly auth = inject(AuthService);

  readonly reviewId = input.required<string>();
  readonly authorId = input<string>();
  readonly bookmarkedByMe = input(false);
  readonly compact = input(false);

  protected readonly busy = signal(false);

  protected readonly isAuthenticated = this.bookmarks.isAuthenticated;

  protected readonly isOwnReview = computed(() => {
    const authorId = this.authorId();
    if (!authorId) {
      return false;
    }
    const user = this.auth.currentUser();
    return !!user && user.id === authorId;
  });

  protected readonly bookmarked = computed(() => {
    this.bookmarks.overridesMap();
    return this.bookmarks.isBookmarked(this.reviewId(), this.bookmarkedByMe());
  });

  protected async onClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOwnReview() || this.busy()) {
      return;
    }

    this.busy.set(true);
    try {
      await this.bookmarks.toggle(this.reviewId(), this.bookmarked(), this.authorId());
    } catch {
      // Toggle reverts inside the service.
    } finally {
      this.busy.set(false);
    }
  }
}
