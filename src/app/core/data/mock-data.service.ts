/**
 * Mock reviews for UI development; supports adding reviews from the post form.
 */
import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from '../auth/auth.models';
import { Collection, CreateReviewInput, Review } from '../models/review.model';
import { UserSummary } from '../models/user.model';
import { normalizeNutrition } from '../utils/nutrition.utils';
import { computeTotalAmount, normalizeReview } from '../utils/review.utils';
import { MOCK_COLLECTIONS, MOCK_REVIEWS, MOCK_USERS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly reviews = signal<Review[]>(
    [...MOCK_REVIEWS].map((r) => normalizeReview(r)).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    ),
  );

  readonly allReviews = this.reviews.asReadonly();
  readonly freshPicks = computed(() => this.reviews().slice(0, 8));
  readonly popularReviews = computed(() =>
    [...this.reviews()].sort((a, b) => b.likeCount - a.likeCount),
  );

  getReviewById(id: string): Review | undefined {
    return this.reviews().find((r) => r.id === id);
  }

  /** Updates like count when mock likes API toggles (floors at 0). */
  adjustLikeCount(reviewId: string, delta: 1 | -1): void {
    this.reviews.update((list) =>
      list.map((r) =>
        r.id === reviewId
          ? { ...r, likeCount: Math.max(0, r.likeCount + delta) }
          : r,
      ),
    );
  }

  /** Prepends a user-created review (mock publish from `/reviews/new`). */
  addReview(input: CreateReviewInput, author: AuthUser | UserSummary): Review {
    const meals = input.meals.map((m) => ({
      name: m.name.trim(),
      quantity: m.quantity >= 1 ? m.quantity : 1,
      price: m.price,
      notes: m.notes.trim(),
    }));
    const body = input.body.trim();
    const review: Review = {
      id: `review-${crypto.randomUUID()}`,
      title: input.title.trim(),
      excerpt: body,
      body,
      placeName: input.placeName.trim(),
      serviceType: input.serviceType,
      partySize: input.partySize,
      meals,
      nutrition: normalizeNutrition(input.nutrition),
      currency: input.currency,
      totalAmount: computeTotalAmount(meals),
      rating: input.rating,
      cuisineTags: input.cuisineTags,
      foodTypeTags: input.foodTypeTags,
      imageUrls: [...input.imageUrls],
      likeCount: 0,
      author: {
        id: author.id,
        name: author.name,
        avatarUrl: author.avatarUrl ?? null,
      },
      publishedAt: new Date().toISOString(),
    };

    this.reviews.update((list) => [review, ...list]);
    return review;
  }

  getUserById(id: string): UserSummary | undefined {
    return MOCK_USERS.find((u) => u.id === id);
  }

  getCollectionsForUser(userId: string): Collection[] {
    return MOCK_COLLECTIONS.filter((c) => c.ownerId === userId && c.isPublic);
  }
}
