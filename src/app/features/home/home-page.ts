/**
 * Home page — hero, most-liked carousel, and paginated latest reviews from the API.
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ReviewsApiService } from '../../core/data/reviews-api.service';
import { Review } from '../../core/models/review.model';
import { HorizontalScrollStrip } from '../../shared/ui/horizontal-scroll-strip/horizontal-scroll-strip';
import { PaginationBar } from '../../shared/ui/pagination-bar/pagination-bar';
import { ReviewCard } from '../../shared/ui/review-card/review-card';

const POPULAR_LIMIT = 10;
const LATEST_PAGE_SIZE = 12;

@Component({
  selector: 'app-home-page',
  imports: [ReviewCard, RouterLink, HorizontalScrollStrip, PaginationBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private readonly reviewsApi = inject(ReviewsApiService);
  private readonly auth = inject(AuthService);

  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly popularReviews = signal<Review[]>([]);
  protected readonly popularLoading = signal(true);
  protected readonly popularError = signal<string | null>(null);

  protected readonly latestReviews = signal<Review[]>([]);
  protected readonly latestPage = signal(1);
  protected readonly latestTotalPages = signal(0);
  protected readonly latestLoading = signal(true);
  protected readonly latestError = signal<string | null>(null);

  ngOnInit(): void {
    void this.loadPopular();
    void this.loadLatest(1);
  }

  protected onLatestPageChange(page: number): void {
    void this.loadLatest(page);
    if (typeof window !== 'undefined') {
      document.getElementById('latest-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private async loadPopular(): Promise<void> {
    this.popularLoading.set(true);
    this.popularError.set(null);
    try {
      const result = await this.reviewsApi.listReviews({
        sort: 'popular',
        page: 1,
        limit: POPULAR_LIMIT,
      });
      this.popularReviews.set(result.reviews);
    } catch {
      this.popularError.set('Could not load popular reviews.');
      this.popularReviews.set([]);
    } finally {
      this.popularLoading.set(false);
    }
  }

  private async loadLatest(page: number): Promise<void> {
    this.latestLoading.set(true);
    this.latestError.set(null);
    try {
      const result = await this.reviewsApi.listReviews({
        sort: 'latest',
        page,
        limit: LATEST_PAGE_SIZE,
      });
      this.latestReviews.set(result.reviews);
      this.latestPage.set(result.page);
      this.latestTotalPages.set(result.totalPages);
    } catch {
      this.latestError.set('Could not load latest reviews.');
      this.latestReviews.set([]);
      this.latestTotalPages.set(0);
    } finally {
      this.latestLoading.set(false);
    }
  }
}
