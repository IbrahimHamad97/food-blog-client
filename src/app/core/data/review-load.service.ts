/**
 * Resolves a review by id — API first, then mock seed data for legacy ids.
 */
import { Injectable, inject } from '@angular/core';
import { Review } from '../models/review.model';
import { MockDataService } from './mock-data.service';
import { ReviewsApiService } from './reviews-api.service';

@Injectable({ providedIn: 'root' })
export class ReviewLoadService {
  private readonly api = inject(ReviewsApiService);
  private readonly mock = inject(MockDataService);

  async loadById(id: string): Promise<Review | undefined> {
    if (!id) {
      return undefined;
    }

    const fromApi = await this.api.getReviewById(id);
    if (fromApi) {
      return fromApi;
    }

    return this.mock.getReviewById(id);
  }
}
