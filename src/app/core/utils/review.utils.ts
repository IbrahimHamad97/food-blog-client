/**
 * Review display helpers and mock seed normalization.
 */
import { MealItem, PriceCurrency, ServiceType } from '../models/meal.model';
import { NutritionInfo } from '../models/nutrition.model';
import { Review, ReviewSeed } from '../models/review.model';
import { normalizeNutrition } from './nutrition.utils';

function normalizeMeals(meals: MealItem[]): MealItem[] {
  return meals.map((m) => ({
    name: m.name,
    quantity: m.quantity >= 1 ? m.quantity : 1,
    price: m.price,
    notes: m.notes ?? '',
  }));
}

function resolveImageUrls(review: ReviewSeed): string[] {
  if (review.imageUrls?.length) {
    return review.imageUrls;
  }
  return review.imageUrl ? [review.imageUrl] : [];
}

function resolveNutrition(review: ReviewSeed): NutritionInfo | null {
  if (review.nutrition) {
    return normalizeNutrition(review.nutrition);
  }
  const legacy = review.dietInfo?.trim();
  return legacy ? normalizeNutrition({ notes: legacy }) : null;
}

/** Fills visit/meal defaults for older mock rows without a full shape. */
export function normalizeReview(review: ReviewSeed): Review {
  const imageUrls = resolveImageUrls(review);
  const nutrition = resolveNutrition(review);
  const { imageUrl: _legacy, dietInfo: _legacyDiet, ...rest } = review;

  if (review.meals?.length) {
    const meals = normalizeMeals(review.meals);
    return {
      ...rest,
      foodTypeTags: (review as ReviewSeed & { foodTypeTags?: string[] }).foodTypeTags ?? [],
      imageUrls,
      nutrition,
      partySize: review.partySize ?? null,
      currency: review.currency ?? 'USD',
      meals,
      totalAmount: review.totalAmount ?? computeTotalAmount(meals),
      likeCount: review.likeCount ?? 0,
    } as Review;
  }

  const meals = normalizeMeals([{ name: review.title, quantity: 1, price: null, notes: '' }]);
  return {
    ...rest,
    foodTypeTags: (review as ReviewSeed & { foodTypeTags?: string[] }).foodTypeTags ?? [],
    imageUrls,
    serviceType: review.serviceType ?? 'dine_in',
    partySize: review.partySize ?? null,
    meals,
    nutrition,
    currency: review.currency ?? 'USD',
    totalAmount: null,
    likeCount: review.likeCount ?? 0,
  } as Review;
}

/** Sum line totals (price × quantity); null if no priced items. */
export function computeTotalAmount(meals: MealItem[]): number | null {
  const priced = meals.filter((m) => m.price != null && !Number.isNaN(m.price));
  if (priced.length === 0) {
    return null;
  }
  return priced.reduce((sum, m) => sum + (m.price ?? 0) * Math.max(1, m.quantity), 0);
}

export function serviceTypeLabel(type: ServiceType): string {
  return type === 'dine_in' ? 'Dine-in' : 'Delivery';
}

export function formatMoney(amount: number, currency: PriceCurrency): string {
  if (currency === 'QAR') {
    return `${amount.toFixed(2)} QAR`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/** Cuisine + food-type tags for cards and filters. */
export function reviewDisplayTags(review: Review): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const tag of [...review.cuisineTags, ...review.foodTypeTags]) {
    const trimmed = tag.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    tags.push(trimmed);
  }
  return tags;
}

export function mealSummary(review: Review): string {
  const count = review.meals.length;
  const first = review.meals[0]?.name;
  if (count <= 1) {
    return first ?? '';
  }
  return `${first} +${count - 1} more`;
}

export function parseCuisineTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function mealLineTotal(meal: MealItem): number | null {
  if (meal.price == null || Number.isNaN(meal.price)) {
    return null;
  }
  return meal.price * Math.max(1, meal.quantity);
}
