/**
 * Sign-in page — Google only; exchanges GIS credential for API session.
 */
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sign-in-page',
  imports: [RouterLink],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.css',
})
export class SignInPage implements AfterViewInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly googleButtonHost = viewChild.required<ElementRef<HTMLElement>>('googleButton');

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly busy = signal(false);

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  /** Renders the official Google Sign-In button into the host element. */
  private renderGoogleButton(): void {
    if (!window.google?.accounts?.id) {
      this.errorMessage.set('Google Sign-In failed to load. Check your connection and refresh.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response) => this.handleGoogleCredential(response.credential),
    });

    window.google.accounts.id.renderButton(this.googleButtonHost().nativeElement, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 320,
    });
  }

  /** GIS callback — sends ID token to our API. */
  private async handleGoogleCredential(credential?: string): Promise<void> {
    if (!credential) {
      this.errorMessage.set('Google did not return a credential.');
      return;
    }

    this.busy.set(true);
    this.errorMessage.set(null);

    try {
      await this.auth.signInWithGoogleIdToken(credential);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const target =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/me';
      await this.router.navigateByUrl(target);
    } catch (err) {
      this.errorMessage.set(this.describeSignInError(err));
    } finally {
      this.busy.set(false);
    }
  }

  /** Turns API/network failures into a short message for the sign-in card. */
  private describeSignInError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Cannot reach the API. In food-blog-server run: npm run dev (and ensure PostgreSQL is up).';
      }
      const apiMessage =
        typeof err.error === 'object' && err.error && 'error' in err.error
          ? String((err.error as { error: string }).error)
          : null;
      return apiMessage ?? `Sign-in failed (HTTP ${err.status}).`;
    }
    return 'Sign-in failed unexpectedly. Check the browser console for details.';
  }
}
