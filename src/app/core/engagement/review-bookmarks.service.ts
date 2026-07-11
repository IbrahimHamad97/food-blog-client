/**
 * Bookmarks orchestration — per-user session overrides cleared on account switch.
 */
import { Injectable, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ReviewsApiService } from '../data/reviews-api.service';

@Injectable({ providedIn: 'root' })
export class ReviewBookmarksService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ReviewsApiService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;

  /** Scoped key → bookmarked state for the active user only. */
  private readonly overrides = signal<ReadonlyMap<string, boolean>>(new Map());
  private lastUserId: string | null = null;

  readonly overridesMap = this.overrides.asReadonly();

  constructor() {
    effect(() => {
      const userId = this.auth.currentUser()?.id ?? null;
      if (userId !== this.lastUserId) {
        this.overrides.set(new Map());
        this.lastUserId = userId;
      }
    });
  }

  /** Bookmarked state for the current user (override wins over server input). */
  isBookmarked(reviewId: string, serverBookmarked: boolean): boolean {
    const key = this.scopedKey(reviewId);
    const override = this.overrides().get(key);
    return override ?? serverBookmarked;
  }

  async toggle(
    reviewId: string,
    currentBookmarked: boolean,
    authorId?: string,
  ): Promise<boolean | null> {
    const user = this.auth.currentUser();
    if (!user) {
      await this.router.navigate(['/sign-in']);
      return null;
    }
    if (authorId && authorId === user.id) {
      return null;
    }

    const nextBookmarked = !currentBookmarked;
    this.setState(reviewId, nextBookmarked);

    try {
      const res = nextBookmarked
        ? await this.api.bookmarkReview(reviewId)
        : await this.api.unbookmarkReview(reviewId);
      this.setState(reviewId, res.bookmarkedByMe);
      return res.bookmarkedByMe;
    } catch {
      this.setState(reviewId, currentBookmarked);
      throw new Error('Could not update bookmark.');
    }
  }

  private scopedKey(reviewId: string): string {
    const userId = this.auth.currentUser()?.id ?? 'guest';
    return `${userId}:${reviewId}`;
  }

  private setState(reviewId: string, bookmarked: boolean): void {
    const next = new Map(this.overrides());
    next.set(this.scopedKey(reviewId), bookmarked);
    this.overrides.set(next);
  }
}
