/**
 * One meal line in the post-review form (`FormArray` child).
 */
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PriceCurrency } from '../../../core/models/meal.model';

@Component({
  selector: 'app-meal-row',
  imports: [ReactiveFormsModule],
  templateUrl: './meal-row.html',
  styleUrl: './meal-row.css',
})
export class MealRow {
  readonly group = input.required<FormGroup>();
  readonly index = input.required<number>();
  readonly canRemove = input(false);
  readonly currency = input<PriceCurrency>('USD');
  readonly remove = output<void>();

  protected pricePrefix(): string {
    return this.currency() === 'QAR' ? 'QAR' : '$';
  }
}
