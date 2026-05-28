/**
 * Cloudinary uploads — signed by the API, uploaded directly from the browser.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Must match server `createUploadSignature` in food-blog-server. */
export const CLOUDINARY_MAX_FILE_BYTES = 10_485_760;

export interface CloudinaryUploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  error?: { message: string };
}

@Injectable({ providedIn: 'root' })
export class UploadsApiService {
  private readonly http = inject(HttpClient);

  /** POST /api/uploads/sign — requires Bearer JWT. */
  signUpload(): Promise<CloudinaryUploadSignature> {
    return firstValueFrom(
      this.http.post<CloudinaryUploadSignature>(`${environment.apiBaseUrl}/uploads/sign`, {}),
    );
  }

  /** Upload one image file using a signature from {@link signUpload}. */
  uploadImage(file: File, signature: CloudinaryUploadSignature): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signature.apiKey);
    form.append('timestamp', String(signature.timestamp));
    form.append('signature', signature.signature);
    form.append('folder', signature.folder);

    return fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      { method: 'POST', body: form },
    ).then(async (res) => {
      const data = (await res.json()) as CloudinaryUploadResponse;
      if (!res.ok) {
        throw new Error(data.error?.message ?? 'Photo upload failed');
      }
      return data.secure_url;
    });
  }
}
