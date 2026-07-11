/**
 * Review HTTP API — create, list, and load reviews from food-blog-server.
 */
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewListPage } from '../models/pagination.model';
import { CreateReviewInput, Review } from '../models/review.model';

interface ReviewResponse {
  review: Review;
}

/** Response from like/unlike endpoints. */
export interface LikeResult {
  likeCount: number;
  likedByMe: boolean;
}

/** Response from bookmark/unbookmark endpoints. */
export interface BookmarkResult {
  bookmarkedByMe: boolean;
}

export type ReviewFeedSort = 'latest' | 'popular';

export interface MyReviewStats {
  likesReceived: number;
  reviewsLiked: number;
  reviewsBookmarked: number;
}

interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function toReviewListPage(response: ReviewListResponse): ReviewListPage {
  return {
    reviews: response.reviews,
    page: response.pagination.page,
    limit: response.pagination.limit,
    total: response.pagination.total,
    totalPages: response.pagination.totalPages,
    hasMore: response.pagination.hasMore,
  };
}

@Injectable({ providedIn: 'root' })
export class ReviewsApiService {
  private readonly http = inject(HttpClient);

  /** GET /api/reviews — public feed. */
  listReviews(options: {
    sort?: ReviewFeedSort;
    page?: number;
    limit?: number;
  } = {}): Promise<ReviewListPage> {
    let params = new HttpParams();
    if (options.sort) {
      params = params.set('sort', options.sort);
    }
    if (options.page != null) {
      params = params.set('page', String(options.page));
    }
    if (options.limit != null) {
      params = params.set('limit', String(options.limit));
    }
    return firstValueFrom(
      this.http.get<ReviewListResponse>(`${environment.apiBaseUrl}/reviews`, { params }),
    ).then(toReviewListPage);
  }

  /** GET /api/reviews/me — signed-in user's reviews. */
  listMyReviews(page = 1, limit = 12): Promise<ReviewListPage> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return firstValueFrom(
      this.http.get<ReviewListResponse>(`${environment.apiBaseUrl}/reviews/me`, { params }),
    ).then(toReviewListPage);
  }

  /** GET /api/reviews/me/likes — reviews the signed-in user has liked. */
  listMyLikedReviews(page = 1, limit = 12): Promise<ReviewListPage> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return firstValueFrom(
      this.http.get<ReviewListResponse>(`${environment.apiBaseUrl}/reviews/me/likes`, { params }),
    ).then(toReviewListPage);
  }

  /** GET /api/reviews/me/bookmarks — reviews the signed-in user has saved. */
  listMyBookmarkedReviews(page = 1, limit = 12): Promise<ReviewListPage> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return firstValueFrom(
      this.http.get<ReviewListResponse>(`${environment.apiBaseUrl}/reviews/me/bookmarks`, { params }),
    ).then(toReviewListPage);
  }

  /** GET /api/reviews/me/stats — dashboard counters. */
  getMyReviewStats(): Promise<MyReviewStats> {
    return firstValueFrom(
      this.http.get<MyReviewStats>(`${environment.apiBaseUrl}/reviews/me/stats`),
    );
  }

  /** POST /api/reviews — requires signed-in user (Bearer via interceptor). */
  async createReview(input: CreateReviewInput): Promise<Review> {
    const { review } = await firstValueFrom(
      this.http.post<ReviewResponse>(`${environment.apiBaseUrl}/reviews`, input),
    );
    return review;
  }

  /** PATCH /api/reviews/:id — owner only. */
  async updateReview(id: string, input: CreateReviewInput): Promise<Review> {
    const { review } = await firstValueFrom(
      this.http.patch<ReviewResponse>(`${environment.apiBaseUrl}/reviews/${id}`, input),
    );
    return review;
  }

  /** DELETE /api/reviews/:id — owner only. */
  async deleteReview(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<{ ok: true }>(`${environment.apiBaseUrl}/reviews/${id}`),
    );
  }

  /** POST /api/reviews/:id/like — like a review (Bearer via interceptor). */
  likeReview(id: string): Promise<LikeResult> {
    return firstValueFrom(
      this.http.post<LikeResult>(`${environment.apiBaseUrl}/reviews/${id}/like`, {}),
    );
  }

  /** DELETE /api/reviews/:id/like — remove a like (Bearer via interceptor). */
  unlikeReview(id: string): Promise<LikeResult> {
    return firstValueFrom(
      this.http.delete<LikeResult>(`${environment.apiBaseUrl}/reviews/${id}/like`),
    );
  }

  /** POST /api/reviews/:id/bookmark — save a review (Bearer via interceptor). */
  bookmarkReview(id: string): Promise<BookmarkResult> {
    return firstValueFrom(
      this.http.post<BookmarkResult>(`${environment.apiBaseUrl}/reviews/${id}/bookmark`, {}),
    );
  }

  /** DELETE /api/reviews/:id/bookmark — remove a bookmark (Bearer via interceptor). */
  unbookmarkReview(id: string): Promise<BookmarkResult> {
    return firstValueFrom(
      this.http.delete<BookmarkResult>(`${environment.apiBaseUrl}/reviews/${id}/bookmark`),
    );
  }

  /** GET /api/reviews/:id — returns null when not found. */
  async getReviewById(id: string): Promise<Review | null> {
    try {
      const { review } = await firstValueFrom(
        this.http.get<ReviewResponse>(`${environment.apiBaseUrl}/reviews/${id}`),
      );
      return review;
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        return null;
      }
      throw err;
    }
  }
}

/** User-facing message from API error JSON. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: string } | null;
    if (body?.error) {
      return body.error;
    }
    if (err.status === 400) {
      return 'Please check the form and try again.';
    }
    if (err.status === 401) {
      return 'You must be signed in to continue.';
    }
    if (err.status === 403) {
      return 'You do not have permission to do that.';
    }
  }
  return fallback;
}
