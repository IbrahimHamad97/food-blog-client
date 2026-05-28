/**
 * Image picker grid — uploads to Cloudinary on pick; stores HTTPS URLs for the review API.
 */
import { Component, OnDestroy, inject, input, model, signal } from '@angular/core';
import {
  CLOUDINARY_MAX_FILE_BYTES,
  UploadsApiService,
} from '../../../core/data/uploads-api.service';

export const MAX_REVIEW_IMAGES = 5;

type SlotStatus = 'uploading' | 'error';

@Component({
  selector: 'app-image-upload-grid',
  templateUrl: './image-upload-grid.html',
  styleUrl: './image-upload-grid.css',
})
export class ImageUploadGrid implements OnDestroy {
  private readonly uploads = inject(UploadsApiService);

  /** Cloudinary HTTPS URLs (blob URLs only while uploading). */
  readonly images = model<string[]>([]);
  readonly max = input(MAX_REVIEW_IMAGES);

  protected readonly uploadError = signal<string | null>(null);
  private readonly slotStatus = signal<Record<string, SlotStatus>>({});
  private readonly blobUrls = new Set<string>();

  ngOnDestroy(): void {
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
  }

  protected canAdd(): boolean {
    return this.images().length < this.max() && !this.hasUploadsInProgress();
  }

  protected isUploading(url: string): boolean {
    return this.slotStatus()[url] === 'uploading';
  }

  protected isError(url: string): boolean {
    return this.slotStatus()[url] === 'error';
  }

  /** True while any photo is still uploading (blob preview not yet replaced). */
  hasUploadsInProgress(): boolean {
    return this.images().some((url) => url.startsWith('blob:') || this.isUploading(url));
  }

  protected async onPick(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';

    if (files.length === 0) {
      return;
    }

    this.uploadError.set(null);

    const remaining = this.max() - this.images().length;
    const toAdd = files.filter((f) => f.type.startsWith('image/')).slice(0, remaining);

    if (toAdd.length === 0) {
      return;
    }

    let signature;
    try {
      signature = await this.uploads.signUpload();
    } catch {
      this.uploadError.set('Could not start upload. Sign in and try again.');
      return;
    }

    for (const file of toAdd) {
      if (file.size > CLOUDINARY_MAX_FILE_BYTES) {
        this.uploadError.set('Each photo must be 10 MB or smaller.');
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      this.blobUrls.add(previewUrl);
      this.images.update((list) => (list.length < this.max() ? [...list, previewUrl] : list));
      this.setSlotStatus(previewUrl, 'uploading');

      try {
        const secureUrl = await this.uploads.uploadImage(file, signature);
        this.replacePreview(previewUrl, secureUrl);
        this.clearSlotStatus(previewUrl);
      } catch {
        this.setSlotStatus(previewUrl, 'error');
        this.uploadError.set('One or more photos failed to upload. Remove them and try again.');
      }
    }
  }

  protected remove(index: number): void {
    const url = this.images()[index];
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      this.blobUrls.delete(url);
    }
    this.clearSlotStatus(url);
    this.images.update((list) => list.filter((_, i) => i !== index));
    this.uploadError.set(null);
  }

  private replacePreview(previewUrl: string, secureUrl: string): void {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      this.blobUrls.delete(previewUrl);
    }
    this.images.update((list) => list.map((url) => (url === previewUrl ? secureUrl : url)));
  }

  private setSlotStatus(url: string, status: SlotStatus): void {
    this.slotStatus.update((map) => ({ ...map, [url]: status }));
  }

  private clearSlotStatus(url: string): void {
    this.slotStatus.update((map) => {
      const next = { ...map };
      delete next[url];
      return next;
    });
  }
}
