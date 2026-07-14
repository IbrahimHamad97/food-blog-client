/**
 * Public user profile — avatar, display name, and their published reviews.
 */
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/data/reviews-api.service';
import { PublicUserProfile, UsersApiService } from '../../core/data/users-api.service';
import { Review } from '../../core/models/review.model';
import { PaginationBar } from '../../shared/ui/pagination-bar/pagination-bar';
import { ReviewCard } from '../../shared/ui/review-card/review-card';
import { UserAvatar } from '../../shared/ui/user-avatar/user-avatar';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-user-profile-page',
  imports: [RouterLink, ReviewCard, PaginationBar, UserAvatar],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.css',
})
export class UserProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersApiService);
  private readonly auth = inject(AuthService);

  private readonly userId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly profile = signal<PublicUserProfile | null>(null);
  protected readonly profileLoading = signal(true);
  protected readonly profileError = signal<string | null>(null);

  protected readonly reviews = signal<Review[]>([]);
  protected readonly reviewsPage = signal(1);
  protected readonly reviewsTotalPages = signal(0);
  protected readonly reviewsTotal = signal(0);
  protected readonly reviewsLoading = signal(true);
  protected readonly reviewsError = signal<string | null>(null);

  protected readonly isSelf = computed(() => {
    const profile = this.profile();
    const me = this.auth.currentUser();
    return !!profile && !!me && profile.id === me.id;
  });

  constructor() {
    effect(() => {
      const id = this.userId();
      untracked(() => {
        void this.loadProfile(id);
      });
    });
  }

  protected onReviewsPageChange(page: number): void {
    const id = this.userId();
    if (!id) {
      return;
    }
    void this.loadReviews(id, page);
  }

  private async loadProfile(userId: string): Promise<void> {
    if (!userId) {
      this.profileError.set('User not found.');
      this.profileLoading.set(false);
      return;
    }

    this.profileLoading.set(true);
    this.profileError.set(null);
    this.reviewsError.set(null);

    try {
      const user = await this.usersApi.getUserById(userId);
      this.profile.set(user);
      await this.loadReviews(userId, 1);
    } catch (err) {
      this.profile.set(null);
      this.reviews.set([]);
      this.profileError.set(apiErrorMessage(err, 'Could not load this profile.'));
    } finally {
      this.profileLoading.set(false);
    }
  }

  private async loadReviews(userId: string, page: number): Promise<void> {
    this.reviewsLoading.set(true);
    this.reviewsError.set(null);
    try {
      const result = await this.usersApi.listUserReviews(userId, page, PAGE_SIZE);
      this.reviews.set(result.reviews);
      this.reviewsPage.set(result.page);
      this.reviewsTotalPages.set(result.totalPages);
      this.reviewsTotal.set(result.total);
    } catch (err) {
      this.reviewsError.set(apiErrorMessage(err, 'Could not load reviews.'));
      this.reviews.set([]);
      this.reviewsTotal.set(0);
      this.reviewsTotalPages.set(0);
    } finally {
      this.reviewsLoading.set(false);
    }
  }
}
