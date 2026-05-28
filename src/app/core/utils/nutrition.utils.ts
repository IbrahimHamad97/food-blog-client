/**
 * Helpers for optional nutrition objects on reviews.
 */
import {
  NUTRITION_FIELD_DEFS,
  NutritionFieldKey,
  NutritionInfo,
} from '../models/nutrition.model';

/** True when at least one nutrition field has a value. */
export function hasNutrition(nutrition: NutritionInfo | null | undefined): boolean {
  if (!nutrition) {
    return false;
  }
  return NUTRITION_FIELD_DEFS.some((f) => (nutrition[f.key]?.trim().length ?? 0) > 0);
}

/** Trim fields; return null if everything is empty. */
export function normalizeNutrition(raw: NutritionInfo | null | undefined): NutritionInfo | null {
  if (!raw) {
    return null;
  }

  const result: NutritionInfo = {};
  for (const field of NUTRITION_FIELD_DEFS) {
    const value = raw[field.key]?.trim();
    if (value) {
      result[field.key] = value;
    }
  }

  return hasNutrition(result) ? result : null;
}

/** Build nutrition from reactive form group values. */
export function nutritionFromFormValue(
  raw: Partial<Record<NutritionFieldKey, string | null | undefined>>,
): NutritionInfo | null {
  const info: NutritionInfo = {};
  for (const field of NUTRITION_FIELD_DEFS) {
    const value = raw[field.key]?.trim();
    if (value) {
      info[field.key] = value;
    }
  }
  return normalizeNutrition(info);
}

/** Icon id for detail cards (inline SVG in template). */
export type NutritionIconId =
  | 'calories'
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'fiber'
  | 'sugar'
  | 'sodium'
  | 'saturatedFat'
  | 'allergens'
  | 'notes'
  | 'default';

const NUTRITION_ICON_BY_KEY: Record<NutritionFieldKey, NutritionIconId> = {
  calories: 'calories',
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
  fiber: 'fiber',
  sugar: 'sugar',
  sodium: 'sodium',
  saturatedFat: 'saturatedFat',
  allergens: 'allergens',
  notes: 'notes',
};

/** Label + value + icon for detail display. */
export function nutritionDisplayEntries(
  nutrition: NutritionInfo,
): ReadonlyArray<{ key: NutritionFieldKey; label: string; value: string; icon: NutritionIconId }> {
  return NUTRITION_FIELD_DEFS.map((f) => ({
    key: f.key,
    label: f.label,
    value: nutrition[f.key]?.trim() ?? '',
    icon: NUTRITION_ICON_BY_KEY[f.key],
  })).filter((e) => e.value.length > 0);
}
