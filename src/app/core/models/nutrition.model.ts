/**
 * Optional per-review nutrition / diet values — all fields are free-text (e.g. "45g", "~800").
 */

export interface NutritionInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  saturatedFat?: string;
  allergens?: string;
  /** Other diet notes (gluten-free, high protein, etc.). */
  notes?: string;
}

export type NutritionFieldKey = keyof NutritionInfo;

/** Form + detail labels for each nutrition field. */
export const NUTRITION_FIELD_DEFS: ReadonlyArray<{
  key: NutritionFieldKey;
  label: string;
  placeholder: string;
}> = [
  { key: 'calories', label: 'Calories', placeholder: 'e.g. 800 kcal' },
  { key: 'protein', label: 'Protein', placeholder: 'e.g. 45g' },
  { key: 'carbs', label: 'Carbs', placeholder: 'e.g. 60g' },
  { key: 'fat', label: 'Fat', placeholder: 'e.g. 22g' },
  { key: 'fiber', label: 'Fiber', placeholder: 'e.g. 8g' },
  { key: 'sugar', label: 'Sugar', placeholder: 'e.g. 12g' },
  { key: 'sodium', label: 'Sodium', placeholder: 'e.g. 900mg' },
  { key: 'saturatedFat', label: 'Saturated fat', placeholder: 'e.g. 6g' },
  { key: 'allergens', label: 'Allergens', placeholder: 'e.g. nuts, dairy' },
  { key: 'notes', label: 'Other notes', placeholder: 'e.g. gluten-free, high protein' },
];
