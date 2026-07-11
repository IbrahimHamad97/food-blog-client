/**
 * Review detail — loads from API, falls back to mock seed for legacy ids.
 */
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { ReviewLoadService } from '../../core/data/review-load.service';
import { ReviewsApiService, apiErrorMessage } from '../../core/data/reviews-api.service';
import { MealItem, PriceCurrency, ServiceType } from '../../core/models/meal.model';
import { NutritionInfo } from '../../core/models/nutrition.model';
import { Review } from '../../core/models/review.model';
import { nutritionDisplayEntries } from '../../core/utils/nutrition.utils';
import {
  formatMoney,
  mealLineTotal as computeMealLineTotal,
  reviewDisplayTags,
  serviceTypeLabel,
} from '../../core/utils/review.utils';
import { RatingStars } from '../../shared/ui/rating-stars/rating-stars';
import { ReviewLikeButton } from '../../shared/ui/review-like-button/review-like-button';
import { ReviewBookmarkButton } from '../../shared/ui/review-bookmark-button/review-bookmark-button';
import { ReviewPhotoGallery } from './review-photo-gallery/review-photo-gallery';

@Component({
  selector: 'app-review-detail-page',
  imports: [RouterLink, RatingStars, ReviewLikeButton, ReviewBookmarkButton, ReviewPhotoGallery],
  templateUrl: './review-detail-page.html',
  styleUrl: './review-detail-page.css',
})
export class ReviewDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loadService = inject(ReviewLoadService);
  private readonly reviewsApi = inject(ReviewsApiService);
  private readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly deleteDialogRef = viewChild<HTMLDialogElement | ElementRef<HTMLDialogElement>>(
    'deleteDialog',
  );

  private readonly reviewId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly loading = signal(false);
  protected readonly review = signal<Review | undefined>(undefined);
  protected readonly loadError = signal<string | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly isOwner = computed(() => {
    const r = this.review();
    const user = this.auth.currentUser();
    return !!r && !!user && r.author.id === user.id;
  });

  constructor() {
    effect(() => {
      const id = this.reviewId();
      untracked(() => {
        void this.fetchReview(id);
      });
    });
  }

  private async fetchReview(id: string): Promise<void> {
    if (!id) {
      this.review.set(undefined);
      this.loadError.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.review.set(undefined);
    this.loadError.set(null);
    try {
      const loaded = await this.loadService.loadById(id);
      this.review.set(loaded);
    } catch (err) {
      this.loadError.set(
        apiErrorMessage(err, 'Could not load this review. Please check your connection and try again.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected openDeleteDialog(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.deleteError.set(null);
    this.deleteDialogEl()?.showModal();
  }

  protected closeDeleteDialog(): void {
    this.deleteDialogEl()?.close();
  }

  private deleteDialogEl(): HTMLDialogElement | undefined {
    const ref = this.deleteDialogRef();
    if (!ref) {
      return undefined;
    }
    if (ref instanceof ElementRef) {
      return ref.nativeElement;
    }
    return ref instanceof HTMLDialogElement ? ref : undefined;
  }

  protected async confirmDelete(): Promise<void> {
    const r = this.review();
    if (!r || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);
    try {
      await this.reviewsApi.deleteReview(r.id);
      this.closeDeleteDialog();
      await this.router.navigate(['/me']);
    } catch (err) {
      this.deleteError.set(apiErrorMessage(err, 'Could not delete this review. Please try again.'));
    } finally {
      this.deleting.set(false);
    }
  }

  protected serviceLabel(type: ServiceType): string {
    return serviceTypeLabel(type);
  }

  protected allTags(r: Review): string[] {
    return reviewDisplayTags(r);
  }

  protected formatPrice(amount: number, currency: PriceCurrency): string {
    return formatMoney(amount, currency);
  }

  protected mealLineTotal(meal: MealItem): number | null {
    return computeMealLineTotal(meal);
  }

  protected nutritionEntries(nutrition: NutritionInfo) {
    return nutritionDisplayEntries(nutrition);
  }
}
