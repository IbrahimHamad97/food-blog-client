/**
 * Post-review form — visit context, meals, rating, publish via {@link ReviewsApiService}.
 */
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { ReviewsApiService, apiErrorMessage } from '../../core/data/reviews-api.service';
import { MealItem, PriceCurrency, ServiceType } from '../../core/models/meal.model';
import { Review } from '../../core/models/review.model';
import { NUTRITION_FIELD_DEFS } from '../../core/models/nutrition.model';
import { nutritionFromFormValue } from '../../core/utils/nutrition.utils';
import { computeTotalAmount, formatMoney } from '../../core/utils/review.utils';
import { CUISINE_TAGS_SEED, FOOD_TYPE_TAGS_SEED } from '../../core/seeds/review-tags.seeds';
import { RatingInput } from '../../shared/ui/rating-input/rating-input';
import { TagMultiSelect } from '../../shared/ui/tag-multi-select/tag-multi-select';
import { ImageUploadGrid } from './image-upload-grid/image-upload-grid';
import { MealRow } from './meal-row/meal-row';

const MAX_MEALS = 10;
const MAX_TAGS = 20;

const DEV_FILL_IMAGES = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
];

@Component({
  selector: 'app-review-form-page',
  imports: [ReactiveFormsModule, RouterLink, RatingInput, TagMultiSelect, MealRow, ImageUploadGrid],
  templateUrl: './review-form-page.html',
  styleUrl: './review-form-page.css',
})
export class ReviewFormPage {
  /** Dev sample-fill — set to `!environment.production` when re-enabling fill buttons. */
  // protected readonly showDevFill = !environment.production;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly reviewsApi = inject(ReviewsApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly editReviewId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly isEditMode = computed(() => this.editReviewId().length > 0);
  protected readonly loadingReview = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly imagesError = signal<string | null>(null);
  protected readonly imageUrls = signal<string[]>([]);
  protected readonly nutritionFields = NUTRITION_FIELD_DEFS;

  constructor() {
    effect(() => {
      if (this.imageUrls().length > 0) {
        this.imagesError.set(null);
      }
    });

    effect(() => {
      const id = this.editReviewId();
      untracked(() => {
        if (id) {
          void this.loadReviewForEdit(id);
        }
      });
    });
  }

  protected readonly form = this.fb.group({
    placeName: ['', Validators.required],
    serviceType: ['dine_in' as ServiceType, Validators.required],
    partySize: [null as number | null, Validators.min(1)],
    currency: ['USD' as PriceCurrency, Validators.required],
    meals: this.fb.array([this.createMealGroup()]),
    title: ['', Validators.required],
    rating: [0, [Validators.required, Validators.min(1)]],
    body: ['', Validators.required],
    cuisineTags: [[] as string[]],
    foodTypeTags: [[] as string[]],
    nutrition: this.createNutritionGroup(),
  });

  protected readonly cuisineTagOptions = CUISINE_TAGS_SEED;
  protected readonly foodTypeTagOptions = FOOD_TYPE_TAGS_SEED;
  protected readonly maxTags = MAX_TAGS;

  protected orderTotalLabel(): string | null {
    const meals = this.formMealsToItems(this.meals.controls);
    const currency = this.form.get('currency')?.value ?? 'USD';
    const total = computeTotalAmount(meals);
    return total != null ? formatMoney(total, currency) : null;
  }

  protected get meals(): FormArray {
    return this.form.get('meals') as FormArray;
  }

  protected mealGroupAt(index: number): FormGroup {
    return this.meals.at(index) as FormGroup;
  }

  protected canAddMeal(): boolean {
    return this.meals.length < MAX_MEALS;
  }

  protected addMeal(): void {
    if (!this.canAddMeal()) {
      return;
    }
    this.meals.push(this.createMealGroup());
  }

  protected removeMeal(index: number): void {
    if (this.meals.length <= 1) {
      return;
    }
    this.meals.removeAt(index);
  }

  protected fillDevFull(): void {
    this.form.patchValue({
      placeName: 'Via Roma Pizzeria',
      serviceType: 'dine_in',
      partySize: 4,
      currency: 'USD',
      title: 'Neapolitan pie with a perfect char',
      rating: 5,
      body: 'Soft center, blistered crust, and buffalo mozzarella that melts into every bite. Wood-fired oven makes all the difference. Would come back with friends.',
      cuisineTags: ['Italian', 'Pizza', 'Mediterranean'],
      foodTypeTags: ['Pizza', 'Desserts'],
      nutrition: {
        calories: '920',
        protein: '38g',
        carbs: '72g',
        fat: '42g',
        fiber: '6g',
        sugar: '8g',
        sodium: '1100mg',
        saturatedFat: '18g',
        allergens: 'gluten, dairy',
        notes: 'High protein option available',
      },
    });
    this.setMeals([
      { name: 'Margherita pizza', quantity: 1, price: 18.5, notes: 'Shared' },
      { name: 'Burrata starter', quantity: 1, price: 12, notes: '' },
      { name: 'Tiramisu', quantity: 2, price: 7, notes: 'Dessert' },
    ]);
    this.imageUrls.set([...DEV_FILL_IMAGES]);
    this.imagesError.set(null);
    this.submitError.set(null);
  }

  protected fillDevMinimal(): void {
    this.form.patchValue({
      placeName: 'Test Kitchen',
      serviceType: 'dine_in',
      partySize: null,
      currency: 'USD',
      title: 'Quick test review',
      rating: 4,
      body: 'Minimum fields filled for testing publish.',
      cuisineTags: [],
      foodTypeTags: [],
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        sodium: '',
        saturatedFat: '',
        allergens: '',
        notes: '',
      },
    });
    this.setMeals([{ name: 'House special', quantity: 1, price: null, notes: '' }]);
    this.imageUrls.set([DEV_FILL_IMAGES[0]]);
    this.imagesError.set(null);
    this.submitError.set(null);
  }

  protected async onSubmit(): Promise<void> {
    this.submitError.set(null);
    this.imagesError.set(null);
    this.form.markAllAsTouched();

    if (this.imageUrls().length > 0) {
      if (this.imageUrls().some((url) => url.startsWith('blob:') || url.startsWith('data:'))) {
        this.imagesError.set('Wait for photos to finish uploading, or remove failed ones.');
        return;
      }

      if (this.imageUrls().some((url) => !url.startsWith('https://'))) {
        this.imagesError.set('All photos must finish uploading before you publish.');
        return;
      }
    }

    if (this.form.invalid) {
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      this.submitError.set('You must be signed in to publish a review.');
      return;
    }

    const raw = this.form.getRawValue();
    const meals = this.formMealsToItems(this.meals.controls);
    const partySize =
      raw.partySize != null && raw.partySize !== ('' as unknown as number)
        ? Number(raw.partySize)
        : null;

    const payload = {
      title: raw.title!,
      body: raw.body!,
      placeName: raw.placeName!,
      serviceType: raw.serviceType!,
      partySize: partySize && partySize >= 1 ? partySize : null,
      meals,
      nutrition: nutritionFromFormValue(raw.nutrition ?? {}),
      currency: raw.currency!,
      rating: raw.rating!,
      cuisineTags: raw.cuisineTags ?? [],
      foodTypeTags: raw.foodTypeTags ?? [],
      imageUrls: this.imageUrls(),
    };

    this.submitting.set(true);
    try {
      const review = this.isEditMode()
        ? await this.reviewsApi.updateReview(this.editReviewId(), payload)
        : await this.reviewsApi.createReview(payload);
      await this.router.navigate(['/reviews', review.id]);
    } catch (err) {
      this.submitError.set(
        apiErrorMessage(
          err,
          this.isEditMode()
            ? 'Could not save your changes. Please try again.'
            : 'Could not publish your review. Please try again.',
        ),
      );
    } finally {
      this.submitting.set(false);
    }
  }

  private async loadReviewForEdit(id: string): Promise<void> {
    this.loadingReview.set(true);
    this.loadError.set(null);
    try {
      const review = await this.reviewsApi.getReviewById(id);
      if (!review) {
        this.loadError.set('Review not found.');
        return;
      }

      const user = this.auth.currentUser();
      if (!user || review.author.id !== user.id) {
        await this.router.navigate(['/reviews', id]);
        return;
      }

      this.populateForm(review);
    } catch (err) {
      this.loadError.set(apiErrorMessage(err, 'Could not load this review for editing.'));
    } finally {
      this.loadingReview.set(false);
    }
  }

  private populateForm(review: Review): void {
    const nutrition = review.nutrition ?? {};
    this.form.patchValue({
      placeName: review.placeName,
      serviceType: review.serviceType,
      partySize: review.partySize,
      currency: review.currency,
      title: review.title,
      rating: review.rating,
      body: review.body,
      cuisineTags: review.cuisineTags,
      foodTypeTags: review.foodTypeTags,
      nutrition: {
        calories: nutrition.calories ?? '',
        protein: nutrition.protein ?? '',
        carbs: nutrition.carbs ?? '',
        fat: nutrition.fat ?? '',
        fiber: nutrition.fiber ?? '',
        sugar: nutrition.sugar ?? '',
        sodium: nutrition.sodium ?? '',
        saturatedFat: nutrition.saturatedFat ?? '',
        allergens: nutrition.allergens ?? '',
        notes: nutrition.notes ?? '',
      },
    });
    this.setMeals(review.meals);
    this.imageUrls.set([...review.imageUrls]);
    this.imagesError.set(null);
    this.submitError.set(null);
  }

  private createNutritionGroup(): FormGroup {
    const controls = NUTRITION_FIELD_DEFS.reduce(
      (acc, field) => {
        acc[field.key] = [''];
        return acc;
      },
      {} as Record<string, string[]>,
    );
    return this.fb.group(controls);
  }

  private setMeals(
    rows: ReadonlyArray<{
      name: string;
      quantity: number;
      price: number | null;
      notes: string;
    }>,
  ): void {
    this.meals.clear();
    for (const row of rows) {
      this.meals.push(
        this.fb.group({
          name: [row.name, Validators.required],
          quantity: [row.quantity, [Validators.required, Validators.min(1)]],
          price: [row.price, Validators.min(0)],
          notes: [row.notes],
        }),
      );
    }
  }

  private createMealGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [null as number | null, Validators.min(0)],
      notes: [''],
    });
  }

  private formMealsToItems(controls: readonly AbstractControl[]): MealItem[] {
    return controls.map((ctrl) => {
      const row = ctrl.value as {
        name: string;
        quantity: number | null | '';
        price: number | null | '';
        notes: string;
      };
      const price =
        row.price === '' || row.price == null || Number.isNaN(Number(row.price))
          ? null
          : Number(row.price);
      const qtyRaw = row.quantity === '' || row.quantity == null ? 1 : Number(row.quantity);
      const quantity = !Number.isNaN(qtyRaw) && qtyRaw >= 1 ? qtyRaw : 1;
      return {
        name: row.name ?? '',
        quantity,
        price: price != null && price >= 0 ? price : null,
        notes: row.notes ?? '',
      };
    });
  }
}
