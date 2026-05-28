/**
 * Mock likes API — in-memory per-user liked reviews (no browser storage).
 * Swap internals for HttpClient when POST/DELETE /api/reviews/:id/like ships.
 */
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MockDataService } from '../data/mock-data.service';

export interface LikeToggleResult {
  likeCount: number;
  likedByMe: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReviewLikesService {
  private readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);
  private readonly router = inject(Router);

  /** In-memory: userId → set of liked review ids (mock DB). */
  private readonly likedByUser = new Map<string, Set<string>>();

  /** Bumps when likes change or the signed-in user changes. */
  private readonly likesRevision = signal(0);

  readonly isAuthenticated = this.auth.isAuthenticated;

  constructor() {
    effect(() => {
      this.auth.currentUser();
      this.likesRevision.update((n) => n + 1);
    });
  }

  /** Whether the current user has liked this review. */
  isLiked(reviewId: string): boolean {
    this.likesRevision();
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return false;
    }
    return this.likedByUser.get(userId)?.has(reviewId) ?? false;
  }

  /** Reactive set of ids the current user liked (for templates). */
  readonly likedIds = computed(() => {
    this.likesRevision();
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return new Set<string>();
    }
    return new Set(this.likedByUser.get(userId) ?? []);
  });

  /** Like or unlike; guests are sent to sign-in. */
  async toggleLike(reviewId: string, authorId?: string): Promise<LikeToggleResult | null> {
    const user = this.auth.currentUser();
    if (!user) {
      await this.router.navigate(['/sign-in']);
      return null;
    }

    if (authorId && authorId === user.id) {
      return null;
    }

    const set = this.getOrCreateSet(user.id);
    let likedByMe: boolean;

    if (set.has(reviewId)) {
      set.delete(reviewId);
      this.data.adjustLikeCount(reviewId, -1);
      likedByMe = false;
    } else {
      set.add(reviewId);
      this.data.adjustLikeCount(reviewId, 1);
      likedByMe = true;
    }

    this.likesRevision.update((n) => n + 1);
    const review = this.data.getReviewById(reviewId);
    return {
      likeCount: review?.likeCount ?? 0,
      likedByMe,
    };
  }

  private getOrCreateSet(userId: string): Set<string> {
    let set = this.likedByUser.get(userId);
    if (!set) {
      set = new Set();
      this.likedByUser.set(userId, set);
    }
    return set;
  }
}
