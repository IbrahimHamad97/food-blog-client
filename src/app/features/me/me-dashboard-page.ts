/**
 * Signed-in user dashboard — paginated reviews from API; likes/collections placeholders.
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ReviewsApiService } from '../../core/data/reviews-api.service';
import { Review } from '../../core/models/review.model';
import { PaginationBar } from '../../shared/ui/pagination-bar/pagination-bar';
import { ReviewCard } from '../../shared/ui/review-card/review-card';

const MY_REVIEWS_PAGE_SIZE = 12;

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyHint: string;
  ctaLabel?: string;
  ctaLink?: string;
}

@Component({
  selector: 'app-me-dashboard-page',
  imports: [RouterLink, ReviewCard, PaginationBar],
  templateUrl: './me-dashboard-page.html',
  styleUrl: './me-dashboard-page.css',
})
export class MeDashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly reviewsApi = inject(ReviewsApiService);

  protected readonly user = this.auth.currentUser;

  protected readonly myReviews = signal<Review[]>([]);
  protected readonly myReviewsPage = signal(1);
  protected readonly myReviewsTotalPages = signal(0);
  protected readonly myReviewsTotal = signal(0);
  protected readonly myReviewsLoading = signal(true);
  protected readonly myReviewsError = signal<string | null>(null);

  protected readonly sections: DashboardSection[] = [
    {
      id: 'likes',
      title: 'Liked reviews',
      description: 'Reviews you have liked from other food lovers.',
      emptyTitle: 'No likes yet',
      emptyHint: 'Browse the home feed and tap the heart on reviews you enjoy.',
      ctaLabel: 'Explore reviews',
      ctaLink: '/',
    },
    {
      id: 'collections',
      title: 'My collections',
      description: 'Curated lists such as “Best pizza” or “Weekend brunch”.',
      emptyTitle: 'No collections yet',
      emptyHint: 'You will be able to group your favorite reviews into shareable lists.',
    },
  ];

  ngOnInit(): void {
    void this.loadMyReviews(1);
  }

  protected onMyReviewsPageChange(page: number): void {
    void this.loadMyReviews(page);
    if (typeof window !== 'undefined') {
      document.getElementById('me-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  protected avatarUrl(): string {
    const current = this.user();
    if (current?.avatarUrl) {
      return current.avatarUrl;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(current?.name ?? 'guest')}`;
  }

  protected onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const name = this.user()?.name ?? 'guest';
    img.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  }

  private async loadMyReviews(page: number): Promise<void> {
    this.myReviewsLoading.set(true);
    this.myReviewsError.set(null);
    try {
      const result = await this.reviewsApi.listMyReviews(page, MY_REVIEWS_PAGE_SIZE);
      this.myReviews.set(result.reviews);
      this.myReviewsPage.set(result.page);
      this.myReviewsTotalPages.set(result.totalPages);
      this.myReviewsTotal.set(result.total);
    } catch {
      this.myReviewsError.set('Could not load your reviews.');
      this.myReviews.set([]);
      this.myReviewsTotal.set(0);
      this.myReviewsTotalPages.set(0);
    } finally {
      this.myReviewsLoading.set(false);
    }
  }
}
