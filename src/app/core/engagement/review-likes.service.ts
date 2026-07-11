/**
 * Likes orchestration — per-user session overrides cleared on account switch.
 */
import { Injectable, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ReviewsApiService } from '../data/reviews-api.service';

/** Current like state for a single review. */
export interface LikeState {
  liked: boolean;
  likeCount: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewLikesService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ReviewsApiService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;

  private readonly overrides = signal<ReadonlyMap<string, LikeState>>(new Map());
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

  /** Like state for the current user (override wins over server input). */
  getState(reviewId: string, serverLiked: boolean, serverCount: number): LikeState {
    const override = this.overrides().get(this.scopedKey(reviewId));
    return override ?? { liked: serverLiked, likeCount: serverCount };
  }

  async toggle(
    reviewId: string,
    currentLiked: boolean,
    currentCount: number,
    authorId?: string,
  ): Promise<LikeState | null> {
    const user = this.auth.currentUser();
    if (!user) {
      await this.router.navigate(['/sign-in']);
      return null;
    }
    if (authorId && authorId === user.id) {
      return null;
    }

    const nextLiked = !currentLiked;
    const optimistic: LikeState = {
      liked: nextLiked,
      likeCount: Math.max(0, currentCount + (nextLiked ? 1 : -1)),
    };
    this.setState(reviewId, optimistic);

    try {
      const res = nextLiked
        ? await this.api.likeReview(reviewId)
        : await this.api.unlikeReview(reviewId);
      const reconciled: LikeState = { liked: res.likedByMe, likeCount: res.likeCount };
      this.setState(reviewId, reconciled);
      return reconciled;
    } catch (err) {
      this.setState(reviewId, { liked: currentLiked, likeCount: currentCount });
      throw err;
    }
  }

  private scopedKey(reviewId: string): string {
    const userId = this.auth.currentUser()?.id ?? 'guest';
    return `${userId}:${reviewId}`;
  }

  private setState(reviewId: string, state: LikeState): void {
    const next = new Map(this.overrides());
    next.set(this.scopedKey(reviewId), state);
    this.overrides.set(next);
  }
}
