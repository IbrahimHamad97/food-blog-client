/**
 * Interactive 1–5 star rating for reactive forms (`formControlName="rating"`).
 */
import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingInput),
      multi: true,
    },
  ],
  template: `
    <div
      class="rating-input"
      role="radiogroup"
      [attr.aria-label]="'Overall rating'"
    >
      @for (star of starValues; track star) {
        <button
          type="button"
          class="rating-input__star"
          [class.rating-input__star--active]="star <= value()"
          [disabled]="disabled()"
          [attr.aria-checked]="value() === star"
          role="radio"
          (click)="select(star)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
            />
          </svg>
          <span class="sr-only">{{ star }} star{{ star === 1 ? '' : 's' }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './rating-input.css',
})
export class RatingInput implements ControlValueAccessor {
  protected readonly starValues = [1, 2, 3, 4, 5] as const;
  protected readonly value = signal(0);
  protected readonly disabled = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value.set(value && value >= 1 && value <= 5 ? value : 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected select(star: number): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(star);
    this.onChange(star);
    this.onTouched();
  }
}
