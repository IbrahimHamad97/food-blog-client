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

export type ReviewFeedSort = 'latest' | 'popular';

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
      this.http.get<ReviewListPage>(`${environment.apiBaseUrl}/reviews`, { params }),
    );
  }

  /** GET /api/reviews/me — signed-in user's reviews. */
  listMyReviews(page = 1, limit = 12): Promise<ReviewListPage> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return firstValueFrom(
      this.http.get<ReviewListPage>(`${environment.apiBaseUrl}/reviews/me`, { params }),
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
