/**
 * Review photos — square preview, carousel overlays, click to expand.
 */
import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-review-photo-gallery',
  templateUrl: './review-photo-gallery.html',
  styleUrl: './review-photo-gallery.css',
})
export class ReviewPhotoGallery {
  readonly imageUrls = input.required<string[]>();
  readonly altPrefix = input('Review photo');

  protected readonly activeIndex = signal(0);
  protected readonly lightboxOpen = signal(false);

  protected readonly currentUrl = computed(() => {
    const urls = this.imageUrls();
    const idx = this.activeIndex();
    return urls[idx] ?? urls[0] ?? '';
  });

  protected readonly hasMultiple = computed(() => this.imageUrls().length > 1);
  protected readonly slideLabel = computed(
    () => `${this.activeIndex() + 1} / ${this.imageUrls().length}`,
  );

  protected onStageClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.photo-gallery__nav')) {
      return;
    }
    this.openLightbox();
  }

  protected onStageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openLightbox();
    }
  }

  protected openLightbox(): void {
    this.lightboxOpen.set(true);
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  protected onLightboxKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeLightbox();
    }
  }

  protected prev(event: Event): void {
    event.stopPropagation();
    const len = this.imageUrls().length;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  protected next(event: Event): void {
    event.stopPropagation();
    const len = this.imageUrls().length;
    this.activeIndex.update((i) => (i + 1) % len);
  }
}
