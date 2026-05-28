# Changelog

All notable changes to the food blog project are documented here. Each entry corresponds to one merged feature slice (or a documentation-only milestone). Format: date, short summary, high-level files or areas touched.

The canonical “what’s done vs planned” list lives in [PROJECT.md](./PROJECT.md).

## [Unreleased]

### 2026-05-26 — Cloudinary photo uploads

- Review form uploads photos to Cloudinary on pick (signed via API); stores `secure_url` in `imageUrls`.
- Upload spinner / error state in `image-upload-grid`; publish blocked until uploads finish.

### 2026-05-26 — Cuisine + food type tag pickers

- Added `cuisines` and `food types` seed lists and replaced the free-text cuisine field with two tag dropdowns.
- Updated review model + detail rendering to include `foodTypeTags`.

### 2026-05-25 — Home and dashboard feeds from API

- Home: top 10 most liked (carousel), latest 12 per page with pagination.
- Dashboard: user's reviews (12 per page), live review count in stats.
- `GET /api/reviews`, `GET /api/reviews/me`; shared `PaginationBar`.

### 2026-05-25 — My dashboard + sign-out flow

- `/me` dashboard — profile header, stats (0), empty states for my reviews, liked reviews, collections.
- Sign out clears session and navigates home; `guestGuard` on sign-in; auth guard preserves `returnUrl`.

**Areas:** `features/me/`, `layout/header`, `core/auth/*`, `app.routes.ts`.

### 2026-05-22 — Post review wired to API

- `ReviewsApiService` — `POST /api/reviews`, `GET /api/reviews/:id`.
- Post form publishes to server; detail loads API first, mock fallback for seed ids.
- Server adds `GET /api/reviews/:id`.

**Areas:** `core/data/reviews-api.service.ts`, `review-load.service.ts`, `review-form-page`, `review-detail-page`, server reviews routes.

### 2026-05-24 — Review likes (mock)

- `likeCount` on reviews; seed data with varied counts; `popularReviews` computed for future home tabs.
- `ReviewLikesService` — in-memory mock API (no localStorage); per-user liked set until page reload.
- `ReviewLikeButton` on review cards (compact, stopPropagation) and detail page.
- Guests see counts; signed-in users toggle like/unlike. API shape documented in PROJECT.md.

**Areas:** `core/engagement`, `core/models`, `core/data`, `shared/ui/review-like-button`, `review-card`, `review-detail-page`.

### 2026-05-24 — Post-review form polish (meals, photos, display)

- Meal **quantity** field; order total uses price × qty.
- Removed input character limits; card body uses CSS line-clamp ellipsis.
- **Multi-photo upload** (up to 5) via plus-square picker; local data URLs for mock.
- No placeholder image — cards/detail hide photos when none uploaded.
- `imageUrls[]` replaces single `imageUrl` on reviews.

**Areas:** `features/reviews`, `core/models`, `shared/ui/review-card`.

### 2026-05-24 — Post a review (client, mock)

- `/reviews/new` — full reactive form: place, dine-in vs delivery, optional party size, dynamic meals (name/price/notes), USD or QAR, auto order total, rating, body, tags, optional cover URL and diet notes.
- `MockDataService.addReview`, extended `Review` model, `normalizeReview` for legacy mock seed.
- `rating-input`, `meal-row`; detail page shows meals and total; cards show visit + meal summary.
- Removed placeholder `review-new-page` stub.

**Areas:** `src/app/features/reviews`, `src/app/core/models`, `src/app/core/utils`, `src/app/shared/ui/rating-input`, `PROJECT.md`.

### 2026-05-24 — Google sign-in (client + server)

- **Server:** `food-blog-server` — Express, Prisma, PostgreSQL, auth API; SERVER.md, README, CHANGELOG.
- **Client:** `/sign-in` page (Google button only), `AuthService`, JWT interceptor, auth guard.
- Header: Sign in link, **Post a review** when authenticated; hero CTA when signed in.

**Areas:** `food-blog-server/`, `src/app/core/auth`, `src/app/features/auth`, header, routes.

### 2026-05-24 — Fresh picks carousel UX

- Hidden scrollbar; left/right arrow buttons; mouse click-and-drag to scroll.
- Shared `HorizontalScrollStrip` component wraps fresh picks on home.

**Areas:** `src/app/shared/ui/horizontal-scroll-strip`, `src/app/features/home`.

### 2026-05-23 — Home page + mock data (Phase 3.1)

- Home: hero, horizontal “Fresh picks”, latest reviews grid with Unsplash images.
- `MockDataService`, models, `ReviewCard`, `RatingStars`; 10 mock reviews.
- Routes: `/`, `/reviews/:id` (minimal detail), `/collections` (explainer stub).
- Collections documented as profile-only — not on home.

**Areas:** `src/app/features/home`, `src/app/features/reviews`, `src/app/core/data`, `src/app/shared/ui`, `PROJECT.md`.

### 2026-05-23 — In-code documentation pass

- JSDoc and learning-focused comments on all app TypeScript files (services, layout, config, bootstrap).
- Documented `inject()`, signals, `protected` template access, and DI in `PROJECT.md` standards.

**Areas:** `src/app/**`, `src/main.ts`, `PROJECT.md`.

### 2026-05-23 — Modern header layout, palette, and motion

- Livelier light (cream + coral) and dark (stone + amber) palettes; Plus Jakarta Sans font.
- Header reworked: nav + theme + Sign in / user menu grouped on the right (fixes theme icon centered on desktop).
- Smooth ~450ms hover/fade transitions on nav, footer links, and buttons; mock Sign in / Sign out for layout preview.

**Areas:** `src/styles.css`, `src/index.html`, `src/app/layout/header`, `src/app/layout/footer`, `src/app/core/auth/mock-auth.service.ts`.

### 2026-05-23 — Theme toggle and slate dark palette

- Header button toggles light/dark; choice saved in `localStorage` (`food-blog-theme`).
- First visit follows OS `prefers-color-scheme` until the user toggles.
- Dark mode uses cool slate tokens (replaces brown charcoal); light beige unchanged.
- `ThemeService` + early `index.html` script to avoid flash of wrong theme.

**Areas:** `src/styles.css`, `src/index.html`, `src/app/core/theme/theme.service.ts`, `src/app/app.config.ts`, `src/app/layout/header`.

### 2026-05-23 — Frontend Phase 1 foundation (theme + layout shell)

- Semantic light/dark CSS variables on `:root` with warm beige (light) and charcoal (dark) palettes; follows OS `prefers-color-scheme`.
- App shell with sticky header, routed main area, and footer pinned to the bottom on short pages.
- Header with brand link, Home / Collections navigation, and mobile hamburger menu.
- Footer with nav links and dynamic copyright year.
- Removed Angular CLI welcome placeholder from root component.

**Areas:** `src/styles.css`, `src/app/layout/app-shell`, `src/app/layout/header`, `src/app/layout/footer`, `src/app/app.ts`, `src/app/app.spec.ts`.

### 2026-05-23 — Project documentation (Phase 0)

- Added public README with architecture, run instructions, and env overview.
- Added PROJECT.md with vision, personas, MVP/V2 feature checklists, API contract, and decisions log.
- Added CHANGELOG.md and established per-feature logging convention.

**Areas:** `README.md`, `PROJECT.md`, `CHANGELOG.md` (client root only).

---

## Template for future entries

```markdown
### YYYY-MM-DD — Short feature title

- One-line summary of user-visible or API behavior.
- Optional second bullet for notable technical choice.

**Areas:** e.g. `food-blog-api/src/modules/reviews`, `food-blog-client/src/app/features/reviews`, Prisma migration `...`
```
