/**
 * Multi-select tag picker — dropdown with checkmarks and removable chips.
 */
import {
  Component,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-tag-multi-select',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagMultiSelect),
      multi: true,
    },
  ],
  templateUrl: './tag-multi-select.html',
  styleUrl: './tag-multi-select.css',
})
export class TagMultiSelect implements ControlValueAccessor {
  readonly options = input.required<readonly string[]>();
  readonly placeholder = input('Select…');
  readonly maxTags = input(20);
  readonly ariaLabel = input('Tag picker');

  protected readonly selected = signal<string[]>([]);
  protected readonly open = signal(false);
  protected readonly disabled = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.selected.set(Array.isArray(value) ? value : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }

  protected isSelected(option: string): boolean {
    return this.selected().includes(option);
  }

  protected triggerLabel(): string {
    const count = this.selected().length;
    if (!count) {
      return this.placeholder();
    }
    return count === 1 ? '1 selected' : `${count} selected`;
  }

  protected toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    this.open.update((value) => !value);
    if (this.open()) {
      this.onTouched();
    }
  }

  protected toggleOption(option: string): void {
    if (this.disabled()) {
      return;
    }

    const current = this.selected();
    if (current.includes(option)) {
      this.updateSelection(current.filter((tag) => tag !== option));
      return;
    }

    if (current.length >= this.maxTags()) {
      return;
    }

    this.updateSelection([...current, option]);
  }

  protected removeTag(tag: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    this.updateSelection(this.selected().filter((item) => item !== tag));
  }

  private updateSelection(next: string[]): void {
    this.selected.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
