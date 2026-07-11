/**
 * Signed-in user dashboard — my reviews, liked reviews, bookmarks, and stats.
 */
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage, ReviewsApiService } from '../../core/data/reviews-api.service';
import { ReviewBookmarksService } from '../../core/engagement/review-bookmarks.service';
import { ReviewLikesService } from '../../core/engagement/review-likes.service';
import { Review } from '../../core/models/review.model';
import {
  BLOCKED_LANGUAGE_MESSAGE,
  containsBlockedLanguage,
} from '../../core/utils/content-filter';
import { PaginationBar } from '../../shared/ui/pagination-bar/pagination-bar';
import { ReviewCard } from '../../shared/ui/review-card/review-card';
import { UserAvatar } from '../../shared/ui/user-avatar/user-avatar';

const PAGE_SIZE = 12;
const NAME_MIN = 2;
const NAME_MAX = 40;

@Component({
  selector: 'app-me-dashboard-page',
  imports: [RouterLink, ReviewCard, PaginationBar, UserAvatar],
  templateUrl: './me-dashboard-page.html',
  styleUrl: './me-dashboard-page.css',
})
export class MeDashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly reviewsApi = inject(ReviewsApiService);
  private readonly likes = inject(ReviewLikesService);
  private readonly bookmarks = inject(ReviewBookmarksService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = this.auth.currentUser;

  protected readonly myReviews = signal<Review[]>([]);
  protected readonly myReviewsPage = signal(1);
  protected readonly myReviewsTotalPages = signal(0);
  protected readonly myReviewsTotal = signal(0);
  protected readonly myReviewsLoading = signal(true);
  protected readonly myReviewsError = signal<string | null>(null);

  protected readonly likedReviews = signal<Review[]>([]);
  protected readonly likedReviewsPage = signal(1);
  protected readonly likedReviewsTotalPages = signal(0);
  protected readonly likedReviewsTotal = signal(0);
  protected readonly likedReviewsLoading = signal(true);
  protected readonly likedReviewsError = signal<string | null>(null);

  protected readonly bookmarkedReviews = signal<Review[]>([]);
  protected readonly bookmarkedReviewsPage = signal(1);
  protected readonly bookmarkedReviewsTotalPages = signal(0);
  protected readonly bookmarkedReviewsTotal = signal(0);
  protected readonly bookmarkedReviewsLoading = signal(true);
  protected readonly bookmarkedReviewsError = signal<string | null>(null);

  protected readonly likesReceived = signal(0);
  protected readonly reviewsLiked = signal(0);
  protected readonly reviewsBookmarked = signal(0);
  protected readonly statsError = signal<string | null>(null);

  protected readonly editingName = signal(false);
  protected readonly nameDraft = signal('');
  protected readonly nameSaving = signal(false);
  protected readonly nameError = signal<string | null>(null);
  protected readonly nameSaved = signal(false);

  /** Liked list with session overrides applied — drops unliked items immediately. */
  protected readonly displayedLikedReviews = computed(() => {
    this.likes.overridesMap();
    return this.likedReviews().filter(
      (review) => this.likes.getState(review.id, review.likedByMe ?? false, review.likeCount).liked,
    );
  });

  /** Bookmarked list with session overrides applied — drops removed bookmarks immediately. */
  protected readonly displayedBookmarkedReviews = computed(() => {
    this.bookmarks.overridesMap();
    return this.bookmarkedReviews().filter((review) =>
      this.bookmarks.isBookmarked(review.id, review.bookmarkedByMe ?? false),
    );
  });

  protected readonly effectiveReviewsLiked = computed(() => {
    const removed = this.likedReviews().length - this.displayedLikedReviews().length;
    return Math.max(0, this.reviewsLiked() - removed);
  });

  protected readonly effectiveReviewsBookmarked = computed(() => {
    const removed = this.bookmarkedReviews().length - this.displayedBookmarkedReviews().length;
    return Math.max(0, this.reviewsBookmarked() - removed);
  });

  ngOnInit(): void {
    void this.refreshAll();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event.urlAfterRedirects.startsWith('/me')) {
          void this.refreshAll();
        }
      });
  }

  protected onMyReviewsPageChange(page: number): void {
    void this.loadMyReviews(page);
    this.scrollTo('me-reviews');
  }

  protected onLikedReviewsPageChange(page: number): void {
    void this.loadLikedReviews(page);
    this.scrollTo('me-likes');
  }

  protected onBookmarkedReviewsPageChange(page: number): void {
    void this.loadBookmarkedReviews(page);
    this.scrollTo('me-bookmarks');
  }

  protected startEditName(): void {
    const user = this.user();
    if (!user) {
      return;
    }
    this.nameDraft.set(user.name);
    this.nameError.set(null);
    this.nameSaved.set(false);
    this.editingName.set(true);
  }

  protected cancelEditName(): void {
    this.editingName.set(false);
    this.nameError.set(null);
    this.nameSaving.set(false);
  }

  protected onNameDraftInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nameDraft.set(value);
    this.nameSaved.set(false);
  }

  protected async saveDisplayName(): Promise<void> {
    const next = this.nameDraft().trim();
    if (next.length < NAME_MIN || next.length > NAME_MAX) {
      this.nameError.set(`Display name must be ${NAME_MIN}–${NAME_MAX} characters.`);
      return;
    }
    if (containsBlockedLanguage(next)) {
      this.nameError.set(BLOCKED_LANGUAGE_MESSAGE);
      return;
    }

    this.nameSaving.set(true);
    this.nameError.set(null);
    try {
      await this.auth.updateDisplayName(next);
      this.editingName.set(false);
      this.nameSaved.set(true);
    } catch (err) {
      this.nameError.set(apiErrorMessage(err, 'Could not update your display name.'));
    } finally {
      this.nameSaving.set(false);
    }
  }

  private scrollTo(id: string): void {
    if (typeof window !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private async refreshAll(): Promise<void> {
    await Promise.all([
      this.loadMyReviews(this.myReviewsPage()),
      this.loadLikedReviews(this.likedReviewsPage()),
      this.loadBookmarkedReviews(this.bookmarkedReviewsPage()),
      this.loadStats(),
    ]);
  }

  private async loadStats(): Promise<void> {
    this.statsError.set(null);
    try {
      const stats = await this.reviewsApi.getMyReviewStats();
      this.likesReceived.set(stats.likesReceived);
      this.reviewsLiked.set(stats.reviewsLiked);
      this.reviewsBookmarked.set(stats.reviewsBookmarked);
    } catch (err) {
      this.statsError.set(apiErrorMessage(err, 'Could not load your stats.'));
      this.likesReceived.set(0);
      this.reviewsLiked.set(0);
      this.reviewsBookmarked.set(0);
    }
  }

  private async loadMyReviews(page: number): Promise<void> {
    this.myReviewsLoading.set(true);
    this.myReviewsError.set(null);
    try {
      const result = await this.reviewsApi.listMyReviews(page, PAGE_SIZE);
      this.myReviews.set(result.reviews);
      this.myReviewsPage.set(result.page);
      this.myReviewsTotalPages.set(result.totalPages);
      this.myReviewsTotal.set(result.total);
    } catch (err) {
      this.myReviewsError.set(apiErrorMessage(err, 'Could not load your reviews.'));
      this.myReviews.set([]);
      this.myReviewsTotal.set(0);
      this.myReviewsTotalPages.set(0);
    } finally {
      this.myReviewsLoading.set(false);
    }
  }

  private async loadLikedReviews(page: number): Promise<void> {
    this.likedReviewsLoading.set(true);
    this.likedReviewsError.set(null);
    try {
      const result = await this.reviewsApi.listMyLikedReviews(page, PAGE_SIZE);
      this.likedReviews.set(result.reviews);
      this.likedReviewsPage.set(result.page);
      this.likedReviewsTotalPages.set(result.totalPages);
      this.likedReviewsTotal.set(result.total);
      this.reviewsLiked.set(result.total);
    } catch (err) {
      this.likedReviewsError.set(apiErrorMessage(err, 'Could not load your liked reviews.'));
      this.likedReviews.set([]);
      this.likedReviewsTotal.set(0);
      this.likedReviewsTotalPages.set(0);
    } finally {
      this.likedReviewsLoading.set(false);
    }
  }

  private async loadBookmarkedReviews(page: number): Promise<void> {
    this.bookmarkedReviewsLoading.set(true);
    this.bookmarkedReviewsError.set(null);
    try {
      const result = await this.reviewsApi.listMyBookmarkedReviews(page, PAGE_SIZE);
      this.bookmarkedReviews.set(result.reviews);
      this.bookmarkedReviewsPage.set(result.page);
      this.bookmarkedReviewsTotalPages.set(result.totalPages);
      this.bookmarkedReviewsTotal.set(result.total);
      this.reviewsBookmarked.set(result.total);
    } catch (err) {
      this.bookmarkedReviewsError.set(
        apiErrorMessage(err, 'Could not load your bookmarked reviews.'),
      );
      this.bookmarkedReviews.set([]);
      this.bookmarkedReviewsTotal.set(0);
      this.bookmarkedReviewsTotalPages.set(0);
    } finally {
      this.bookmarkedReviewsLoading.set(false);
    }
  }
}
