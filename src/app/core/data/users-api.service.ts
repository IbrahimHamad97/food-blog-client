/**
 * Public user profiles API.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewListPage } from '../models/pagination.model';
import { Review } from '../models/review.model';
import { UserSummary } from '../models/user.model';

export interface PublicUserProfile extends UserSummary {
  reviewCount: number;
}

interface PublicUserResponse {
  user: PublicUserProfile;
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
export class UsersApiService {
  private readonly http = inject(HttpClient);

  /** GET /api/users/:id — public profile (no email). */
  getUserById(userId: string): Promise<PublicUserProfile> {
    return firstValueFrom(
      this.http.get<PublicUserResponse>(`${environment.apiBaseUrl}/users/${userId}`),
    ).then((res) => res.user);
  }

  /** GET /api/users/:id/reviews — paginated reviews by that author. */
  listUserReviews(userId: string, page = 1, limit = 12): Promise<ReviewListPage> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return firstValueFrom(
      this.http.get<ReviewListResponse>(`${environment.apiBaseUrl}/users/${userId}/reviews`, {
        params,
      }),
    ).then(toReviewListPage);
  }
}
