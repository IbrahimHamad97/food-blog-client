# Food Blog — Project spec

**Source of truth for this product.** Any agent or contributor should read this file first.

- **Scope, UX decisions, and progress** live here (not only in chat or `.cursor/plans`).
- **Every feature or meaningful change** must update this file: checklist status, routes, decisions log, and relevant spec sections.
- Public onboarding: [README.md](./README.md). Shipped history: [CHANGELOG.md](./CHANGELOG.md). Implementation order: `.cursor/plans/food_blog_roadmap_7386f45e.plan.md` (may lag; **this file wins on product decisions**).

---

## Vision

A personal-but-social food blog where anyone can read reviews and public collections, and signed-in users (Google only) can publish reviews and curate lists. Keep the API separate from the Angular SSR host so auth, database access, and business rules stay in one Express service that is easy to test and document.

## Personas

| Persona | Goals |
| ------- | ----- |
| **Visitor** | Discover recent reviews, open a review or public collection, view a user’s public profile. No account required. |
| **Contributor** | Sign in with Google, write/edit/delete own reviews, create collections, add/remove reviews in own collections, use `/me` dashboard. |
| **Future moderator / admin** | Not in MVP; see “Later / optional” below. |

## Tech stack (decided)

| Layer | Choice |
| ----- | ------ |
| Frontend | Angular 21, Tailwind 4, standalone components, signals where helpful |
| SSR | Express in `src/server.ts` — **host only**, no REST API |
| Backend | Node 20+, TypeScript, Express 5, Prisma, PostgreSQL (`food-blog-server`) |
| Auth | Google Identity Services → ID token → API verifies → JWT session |
| Validation (API) | Zod |
| Client HTTP | `provideHttpClient` + auth interceptor |
| Media | Cloudinary — signed upload via `UploadsApiService` |

## Repo layout (target)

```
food-blog/
├── food-blog-client/     # Angular (this folder)
├── food-blog-server/     # Express + Prisma + PostgreSQL (API)
└── (optional) docker-compose.yml at root for Postgres
```

## Feature checklist

Status keys: `[ ]` planned · `[~]` in progress · `[x]` done

### Documentation & scaffolding

- [x] Phase 0 — README, CHANGELOG, PROJECT (this file)
- [x] Phase 1 — Initialize `food-blog-server` (health, Prisma schema, auth)
- [x] Phase 1 — `food-blog-server/SERVER.md` + README + CHANGELOG

### MVP (build in this order)

| # | Feature | Public | Signed-in | Status |
| - | ------- | ------ | --------- | ------ |
| 1 | Google sign-in / session | — | required for writes | [x] |
| 2 | Home feed — hero, popular (10), latest reviews (API, paginated) | yes | — | [x] |
| 3 | Review detail page | yes | — | [x] API + mock fallback for legacy seed ids |
| 4 | Create / edit / delete **own** review | — | yes | [x] create, edit (`/reviews/:id/edit`), delete with confirm |
| 5 | User profile (public: name, avatar, their reviews) | yes | — | [ ] |
| 6 | Collections — create, rename, add/remove reviews; public list if `isPublic` | browse public | owner manages | [ ] |
| 7 | Collection detail (curated list) | yes if public | — | [ ] |

### Frontend routes (planned)

| Path | Component area | Guard | Status |
| ---- | -------------- | ----- | ------ |
| `/` | `features/home` | — | [x] |
| `/reviews/:id` | `features/reviews` detail | — | [x] |
| `/collections` | explainer stub (not global browse) | — | [~] |
| `/sign-in` | Google sign-in page | — | [x] |
| `/reviews/new` | post review form (API save) | auth | [x] |
| `/reviews/:id/edit` | review editor (same form as create) | auth + owner | [x] |
| `/collections/:id` | `features/collections` | — | [ ] |
| `/collections/new` | collection form | auth | [ ] |
| `/users/:id` | `features/profile` | — | [ ] |
| `/me` | dashboard (my reviews API, likes/collections empty) | auth | [x] |

### Frontend structure (target)

```
src/app/
├── core/           # auth, guards, ReviewsApiService, UploadsApiService, mock fallback
├── shared/         # review-card, tag-multi-select, pagination-bar, likes
├── features/
│   ├── home/
│   ├── reviews/
│   ├── collections/
│   └── profile/
└── layout/         # header, footer, shell
```

### Home page (`/`) — design spec

**Status:** [x] Built — loads from API (`GET /api/reviews`).

**Collections on home:** **No** — collections are user-created lists (e.g. “Chinese food”) built by adding existing reviews. Visitors see them on **that user’s profile**, not on the home page or a global collections feed in v1. Nav “Collections” links to a short explainer stub until profile pages ship.

**Explicitly out of scope for first home version:** filter tabs (highest rated, popular, trending, etc.) — deferred to V2 when we have real traffic data and search.

#### Layout (implemented)

| Section | Layout | Content | Status |
| ------- | ------ | ------- | ------ |
| **Hero** | Full width, compact | Tagline + “Post a review” when signed in | [x] |
| **Top meals** | Horizontal scroll (arrows, drag; links work) | Top 10 by `likeCount` (`ReviewCard` carousel) | [x] |
| **Latest reviews** | Vertical grid (1 / 2 / 3 cols) + pagination | 12 per page, `sort=latest` | [x] |
| ~~Collections spotlight~~ | — | Removed — see collections model below | n/a |

**Card click** → `/reviews/:id`. Cards show up to 2 cuisine/food-type tags + `+N`.

#### Collections model (product)

| Aspect | Rule |
| ------ | ---- |
| **What it is** | A user creates a collection, names it (e.g. “Chinese food”), adds **their** (or any?) reviews to it |
| **Who sees it** | Public collections visible on **owner’s profile** (`/users/:id`); optional `isPublic` flag |
| **Home / global browse** | Not in v1 — `/collections` is an explainer stub only |
| **Later** | Site-wide collection discovery, cuisine browse, or featured lists → V2+ if needed |

#### Mock data (implemented)

- 10 reviews with Unsplash food images, ratings, places, authors — `core/data/mock-data.ts`
- 2 sample collections attached to users for future profile work
- `MockDataService` — `allReviews`, `freshPicks`, `popularReviews`, `getReviewById`, `addReview`, `adjustLikeCount`
- `ReviewLikesService` — persistent likes via API (`POST`/`DELETE /reviews/:id/like`) with a session override map so all instances of a review stay in sync; `ReviewLikeButton` on cards + detail
- `normalizeReview` — legacy seed rows get default `meals` / `serviceType`

#### Decisions (closed)

- [x] Home = reviews only (no collections spotlight)
- [x] Hero: static tagline
- [x] Top meals = popular carousel; latest grid paginated from API
- [x] Cannot like own review (muted pill, still shows count)

---

### V2 (after MVP stable)

- [ ] Search & filters (cuisine tag, rating, place name, **popular / trending / highest rated**)
- [x] Review likes (persisted) — count + toggle when signed in; backs popular sort
- [ ] Home feed tabs: latest vs popular (`popularReviews` ready)
- [ ] Review view counts (server-side increment; deferred)
- [ ] Bookmarks / favorites on others’ reviews (overlap with likes — pick one product term)
- [x] Image upload (Cloudinary) on post-review form
- [ ] Rich text or markdown for review body
- [ ] Cursor-based pagination (feed, profile)
- [ ] SSR prerender for public review/collection URLs (`app.routes.server.ts`)

### Later / optional

- [ ] Comments on reviews
- [ ] Follow users
- [ ] Report / moderation
- [ ] Admin role

### Frontend Phase 1 — Foundation and navigation (UI-first)

| Step | Task | Status |
| ---- | ---- | ------ |
| 1.1 | Light + dark theme tokens (`styles.css`) | [x] |
| 1.1b | Theme toggle in header + `ThemeService` + `localStorage` | [x] |
| 1.1c | Slate dark palette (`data-theme="dark"`, not brown OS-only) | [x] |
| 1.2 | `layout/app-shell` — header, main, footer column layout | [x] |
| 1.3 | `layout/header` — logo, nav, theme toggle, mock Sign in / user menu (right cluster) | [x] |
| 1.4 | `layout/footer` — links + copyright | [x] |
| 1.5 | Routes: home, collections stub, review detail (mock) | [x] |
| 1.6 | Remove CLI welcome; fix `app.css` / root template | [x] |
| 1.7 | Modern palette, hover transitions, Plus Jakarta Sans | [x] |
| 1.8 | In-code documentation standard applied to existing TS files | [x] |
| 2.3 | `shared/ui/rating-stars` | [x] |
| 2.4 | `core/models` + `MockDataService` + mock images | [x] |
| 3.1 | Home page UI — see **Home page (`/`)** | [x] |
| 3.2 | `shared/ui/review-card` | [x] |
| 3.3 | Review detail page (mock) | [x] |
| 4.0 | Post review form + mock publish | [x] |
| 4.0b | `rating-input`, `meal-row`, visit/meals model | [x] |

### Small fixes (bundle with first real UI work)

- [x] Replace default welcome `app.html` with app shell
- [x] Fix `app.css` reference (inline root template, no missing stylesheet)
- [x] `provideHttpClient` + auth interceptor in `app.config.ts`

---

## Client review model (mock / target API shape)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `placeName` | string | Restaurant / venue |
| `serviceType` | `dine_in` \| `delivery` | Delivery includes take-out style orders |
| `partySize` | number \| null | Optional headcount |
| `meals` | `{ name, price?, notes? }[]` | Min 1; prices in selected `currency` |
| `currency` | `USD` \| `QAR` | Meal prices and computed `totalAmount` |
| `totalAmount` | number \| null | Sum of meal prices when any price set |
| `nutrition` | object \| null | Optional fields: calories, protein, carbs, fat, fiber, sugar, sodium, saturated fat, allergens, notes |
| `title`, `body`, `rating`, `cuisineTags[]`, `foodTypeTags[]`, `imageUrls[]` | — | Tags via seed pickers on form |
| `likeCount` | number | Public total; persisted server-side via `ReviewLike` rows |
| `likedByMe` | boolean? | Whether the signed-in viewer liked it (server-computed; absent when anonymous) |

**Image upload:** Cloudinary direct upload (signed via `POST /api/uploads/sign`) → `secure_url` in `imageUrls[]` on create/update review. `image-upload-grid` uploads on pick.

## Data model (initial Prisma)

- **User** — `id`, `googleId`, `email`, `name`, `avatarUrl`, `createdAt`
- **Review** — `userId`, `title`, `body`, `rating` (1–5), `placeName`, `serviceType`, `partySize`, `meals` (JSON), `currency`, `totalAmount`, `nutrition` (JSON), `cuisineTags[]`, `imageUrls[]`, `likeCount`, timestamps
- **ReviewLike** — `userId`, `reviewId` (join table; one row per like)
- **Collection** — `userId`, `name`, `description`, `isPublic`; user adds **review IDs** they curated. Surfaced on **owner profile**, not home feed (v1).
- **CollectionItem** — `collectionId` + `reviewId`

---

## API contract (client ↔ `food-blog-server`)

Base path: `/api` (e.g. `http://localhost:3000/api`). See [SERVER.md](../food-blog-server/SERVER.md) for full spec.

| Method | Path | Auth | Status |
| ------ | ---- | ---- | ------ |
| GET | `/health` | — | [x] |
| POST | `/auth/google` | — | [x] |
| GET | `/auth/me` | JWT | [x] |
| POST | `/auth/logout` | JWT | [x] |
| GET | `/reviews` | — | [x] `sort`, `page`, `limit` |
| GET | `/reviews/me` | JWT | [x] |
| GET | `/reviews/:id` | — | [x] |
| POST | `/reviews` | JWT | [x] |
| PATCH | `/reviews/:id` | JWT owner | [x] |
| DELETE | `/reviews/:id` | JWT owner | [x] |
| POST | `/uploads/sign` | JWT | [x] Cloudinary signature |
| POST | `/reviews/:id/like` | JWT | [x] persisted; returns `{ likeCount, likedByMe }` |
| DELETE | `/reviews/:id/like` | JWT | [x] persisted; returns `{ likeCount, likedByMe }` |
| GET | `/users/:id` | — | Public profile |
| GET | `/users/:id/reviews` | — | User’s reviews |
| GET | `/collections/:id` | — if public | Collection + items |
| POST | `/collections` | JWT | Create collection |
| PATCH | `/collections/:id` | JWT owner | Update collection |
| POST | `/collections/:id/items` | JWT owner | Add review to collection |
| DELETE | `/collections/:id/items/:reviewId` | JWT owner | Remove item |

**Auth flow (MVP):**

1. Angular: Google Identity Services → ID token  
2. `POST /api/auth/google` — verify with Google, upsert user, return JWT (+ user DTO)  
3. Client stores JWT (v1: Bearer in memory or `localStorage`; prefer httpOnly cookie when hardened)  
4. Protected routes use `AuthGuard`; browse routes stay public  

**CORS:** API allows `http://localhost:4200` in dev; production origins via `CORS_ORIGIN`.

---

## Environment & secrets

| Secret / config | Where |
| --------------- | ----- |
| Google OAuth Web client | Google Cloud Console; origins `http://localhost:4200` |
| `GOOGLE_CLIENT_ID` | Client env + API `.env` |
| `JWT_SECRET` | API only |
| `DATABASE_URL` | API only |
| Never commit | `.env` / `.env*` on server; local `.env` only (see server README) |

---

## Code documentation standard (Angular client)

Every new or touched TypeScript file should include:

| What | Rule |
| ---- | ---- |
| **File header** | 2–4 lines: what this file is for and how it fits the app |
| **Services** | Explain `providedIn: 'root'`, why `inject()` is used, SSR/browser guards if any |
| **Components** | Note `imports` / `selector`; explain `protected` vs `private` for template access |
| **Signals** | Brief note when a `signal` or `computed` holds UI state |
| **Methods** | JSDoc on public/protected handlers the template calls; skip trivial one-liners only when obvious |
| **Interfaces / constants** | One line each when the name alone is not clear |

**Teach-as-we-go:** When we use Angular patterns (`inject`, `signal`, `provideAppInitializer`, `RouterLink`), add a short comment the first time in that file — not repeated in every file.

**Skip:** Obvious getters, test boilerplate, generated code, and CSS unless a variable block is non-obvious (theme tokens are documented in `styles.css`).

---

## How we work (per feature slice)

1. Mark feature **in progress** in this file (`[~]` or note in table).  
2. API + Prisma migration if needed.  
3. Angular feature + routes.  
4. Apply **Code documentation standard** above; API modules get a README snippet when they ship.  
5. Manual test notes in PR/commit.  
6. **CHANGELOG.md** entry + mark **done** here.

**Next implementation order (frontend-first):** Finish Phase 1 step 1.5 (routes) → Phase 2 shared components + mock data → **Home page per spec above (3.1)** → remaining public pages → auth/forms UI → backend when UI is approved.

---

## Decisions log

| Date | Decision | Rationale |
| ---- | -------- | --------- |
| 2026-05-23 | Separate `food-blog-api` from Angular SSR server | Single place for auth/DB; client calls API over HTTP |
| 2026-05-23 | Express 5 + Prisma + PostgreSQL | Team choice; typed schema and migrations |
| 2026-05-23 | Google-only sign-in for writes | Simple MVP; no password storage |
| 2026-05-23 | Tailwind-only UI v1 | No Angular Material unless requested later |
| 2026-05-23 | Docs in `food-blog-client/` root | README public; PROJECT internal; CHANGELOG per merge |
| 2026-05-23 | JWT in memory/localStorage for v1 | Simplicity; httpOnly cookie noted for hardening |
| 2026-05-23 | `PROJECT.md` is source of truth | Any agent/feature work must update this file |
| 2026-05-23 | Collections on profile only in v1 | User-curated lists; not home/global browse |
| 2026-05-23 | Home MVP shipped with mock data | Hero + fresh carousel + grid; Unsplash images |
| 2026-05-24 | API folder `food-blog-server` | Matches repo; see SERVER.md |
| 2026-05-24 | Google sign-in page + real AuthService | Mock auth retired |
| 2026-05-22 | `POST /api/reviews` | Create review in PostgreSQL; client still mock until wired |
| 2026-05-24 | Post review form (mock) | Visit type dine-in/delivery, meals FormArray, USD/QAR, auto total |
| 2026-05-23 | Frontend-first; backend after UI sign-off | See `.cursor/plans/food_blog_roadmap_7386f45e.plan.md` |
| 2026-05-26 | Tag multi-select + Cloudinary uploads | `TagMultiSelect`, `UploadsApiService`, signed browser upload |
| 2026-05-28 | Edit/delete own review on detail | `PATCH`/`DELETE` API; confirm dialog; `/reviews/:id/edit` |
| 2026-05-28 | Own-review like UI | Non-interactive pill when `author.id === currentUser` |

---

## Out of scope (for now)

- Production deployment (recommended: Neon + Render + Cloudflare Pages — not documented in repo yet)
- CI/CD pipelines
- Automated E2E tests (unless requested)
- Embedding REST API inside `food-blog-client/src/server.ts`
