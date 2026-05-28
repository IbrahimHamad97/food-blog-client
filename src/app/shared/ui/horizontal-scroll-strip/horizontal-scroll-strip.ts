/**
 * Horizontal scroll row: hidden scrollbar, edge arrows, mouse drag-to-scroll.
 * Touch devices use native swipe; phones keep momentum scrolling.
 */
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';

/** Pixels of movement before a drag counts as scroll (not a link click). */
const DRAG_THRESHOLD_PX = 5;

@Component({
  selector: 'app-horizontal-scroll-strip',
  templateUrl: './horizontal-scroll-strip.html',
  styleUrl: './horizontal-scroll-strip.css',
})
export class HorizontalScrollStrip implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  /** Accessible name for the scrollable region (maps from `aria-label` on the host). */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** Scrollable element that wraps projected cards. */
  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');

  /** Show left arrow when content is scrolled away from the start. */
  protected readonly canScrollLeft = signal(false);

  /** Show right arrow when more content exists off-screen. */
  protected readonly canScrollRight = signal(false);

  protected readonly isDragging = signal(false);

  private dragMoved = false;
  private dragStartX = 0;
  private dragScrollLeft = 0;
  private activePointerId: number | null = null;

  private scrollListener = () => this.updateArrowVisibility();
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const track = this.trackRef().nativeElement;
    track.addEventListener('scroll', this.scrollListener, { passive: true });
    this.resizeObserver = new ResizeObserver(() => this.updateArrowVisibility());
    this.resizeObserver.observe(track);
    this.updateArrowVisibility();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const track = this.trackRef().nativeElement;
    track.removeEventListener('scroll', this.scrollListener);
    this.resizeObserver?.disconnect();
  }

  /** Smooth scroll by ~75% of the visible width. */
  protected scrollStep(direction: 'left' | 'right'): void {
    const track = this.trackRef().nativeElement;
    const amount = Math.max(track.clientWidth * 0.75, 280);
    track.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  /** Desktop: click-and-drag to scroll (like swiping on a phone). */
  protected onPointerDown(event: PointerEvent): void {
    if (!isPlatformBrowser(this.platformId) || event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('a, button')) {
      return;
    }

    const track = this.trackRef().nativeElement;
    this.activePointerId = event.pointerId;
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    this.dragScrollLeft = track.scrollLeft;
    this.isDragging.set(true);
    track.setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId || !this.isDragging()) {
      return;
    }

    const track = this.trackRef().nativeElement;
    const delta = event.clientX - this.dragStartX;

    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      this.dragMoved = true;
    }

    track.scrollLeft = this.dragScrollLeft - delta;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    const track = this.trackRef().nativeElement;
    track.releasePointerCapture(event.pointerId);
    this.activePointerId = null;
    this.isDragging.set(false);
  }

  /**
   * If the user dragged, cancel the click so review links do not open accidentally.
   */
  protected onTrackClick(event: MouseEvent): void {
    if (!this.dragMoved) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.dragMoved = false;
  }

  private updateArrowVisibility(): void {
    const track = this.trackRef().nativeElement;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const slop = 2;

    this.canScrollLeft.set(track.scrollLeft > slop);
    this.canScrollRight.set(track.scrollLeft < maxScroll - slop);
  }
}
