/**
 * Client-side route table — maps URL paths to page components.
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { SignInPage } from './features/auth/sign-in-page';
import { HomePage } from './features/home/home-page';
import { ReviewDetailPage } from './features/reviews/review-detail-page';
import { ReviewFormPage } from './features/reviews/review-form-page';
import { MeDashboardPage } from './features/me/me-dashboard-page';

/** Route definitions consumed by `provideRouter` in {@link app.config}. */
export const routes: Routes = [
  { path: '', component: HomePage, title: "Brho's Food Blog" },
  { path: 'sign-in', component: SignInPage, title: 'Sign in', canActivate: [guestGuard] },
  { path: 'me', component: MeDashboardPage, title: 'My dashboard', canActivate: [authGuard] },
  {
    path: 'reviews/new',
    component: ReviewFormPage,
    title: 'Post a review',
    canActivate: [authGuard],
  },
  {
    path: 'reviews/:id/edit',
    component: ReviewFormPage,
    title: 'Edit review',
    canActivate: [authGuard],
  },
  { path: 'reviews/:id', component: ReviewDetailPage, title: 'Review' },
  { path: '**', redirectTo: '' },
];
