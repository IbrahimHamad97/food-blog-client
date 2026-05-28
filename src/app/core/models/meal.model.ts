/**
 * Meal and visit enums used on reviews and the post-review form.
 */

/** One dish ordered during a visit. */
export interface MealItem {
  name: string;
  /** How many of this item were ordered (defaults to 1). */
  quantity: number;
  /** Null when the user leaves price blank (per-item price). */
  price: number | null;
  notes: string;
}

/** Dine-in at the venue vs delivery (includes take-out style orders). */
export type ServiceType = 'dine_in' | 'delivery';

/** Currency for meal prices and the computed order total. */
export type PriceCurrency = 'USD' | 'QAR';
