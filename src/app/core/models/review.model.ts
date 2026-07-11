import { MealItem, PriceCurrency, ServiceType } from './meal.model';
import { NutritionInfo } from './nutrition.model';
import { UserSummary } from './user.model';

/**
 * A restaurant visit review — main content on home feed and detail pages.
 */
export interface Review {
  id: string;
  title: string;
  /** Short teaser for cards; derived from `body` on create. */
  excerpt: string;
  body: string;
  placeName: string;
  serviceType: ServiceType;
  /** Optional — how many people (including the reviewer). */
  partySize: number | null;
  meals: MealItem[];
  /** Optional macros and diet notes — null when nothing was entered. */
  nutrition: NutritionInfo | null;
  currency: PriceCurrency;
  /** Sum of meal prices when any price is set; null otherwise. */
  totalAmount: number | null;
  rating: number;
  cuisineTags: string[];
  /** Optional tags for menu/category filtering (e.g. Pizza, Sushi). */
  foodTypeTags: string[];
  /** Empty when the review has no photos. */
  imageUrls: string[];
  /** Total likes from all users (display + popular sort). */
  likeCount: number;
  /** Whether the signed-in viewer has liked this review (false/absent when anonymous). */
  likedByMe?: boolean;
  /** Whether the signed-in viewer has bookmarked this review (false/absent when anonymous). */
  bookmarkedByMe?: boolean;
  author: UserSummary;
  publishedAt: string;
}

/**
 * User-curated list of reviews — shown on the owner's profile when public.
 */
export interface Collection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  reviewIds: string[];
}

/** Payload from the post-review form (before id, author, dates, total). */
export interface CreateReviewInput {
  title: string;
  body: string;
  placeName: string;
  serviceType: ServiceType;
  partySize: number | null;
  meals: MealItem[];
  nutrition: NutritionInfo | null;
  currency: PriceCurrency;
  rating: number;
  cuisineTags: string[];
  foodTypeTags: string[];
  imageUrls: string[];
}

/**
 * Mock seed row — legacy reviews omit visit/meal fields; {@link normalizeReview} fills defaults.
 */
export type ReviewSeed = Omit<
  Review,
  'serviceType' | 'partySize' | 'meals' | 'nutrition' | 'currency' | 'totalAmount' | 'imageUrls' | 'likeCount'
> &
  Partial<
    Pick<
      Review,
      | 'serviceType'
      | 'partySize'
      | 'meals'
      | 'nutrition'
      | 'currency'
      | 'totalAmount'
      | 'imageUrls'
      | 'likeCount'
    >
  > & {
    /** Legacy mock seed — converted to `imageUrls` in {@link normalizeReview}. */
    imageUrl?: string;
    /** Legacy free-text — migrated to `nutrition.notes` in {@link normalizeReview}. */
    dietInfo?: string;
  };
