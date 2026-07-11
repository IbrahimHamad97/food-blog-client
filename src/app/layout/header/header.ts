/**
 * Site header — branding, navigation, theme toggle, and auth controls.
 */
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { UserAvatar } from '../../shared/ui/user-avatar/user-avatar';

/** Primary nav item shown in desktop bar and mobile drawer. */
interface NavLink {
  label: string;
  path: string;
  /** Only show when the user is signed in. */
  authOnly?: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, UserAvatar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly themeService = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly siteName = 'Food Blog';
  protected readonly isDark = this.themeService.isDark;
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly currentUser = this.auth.currentUser;

  protected readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Post a review', path: '/reviews/new', authOnly: true },
  ];

  protected readonly mobileMenuOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

  protected visibleNavLinks(): NavLink[] {
    return this.navLinks.filter((link) => !link.authOnly || this.isAuthenticated());
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected themeToggleLabel(): string {
    return this.themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode';
  }

  protected async goToDashboard(): Promise<void> {
    this.closeMobileMenu();
    await this.router.navigate(['/me']);
  }

  protected async signOut(): Promise<void> {
    this.userMenuOpen.set(false);
    this.closeMobileMenu();
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }

  /** Close menu only when focus leaves the profile control (not when moving to a menu item). */
  protected onUserFocusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && container.contains(next)) {
      return;
    }
    queueMicrotask(() => {
      if (!container.contains(document.activeElement)) {
        this.closeUserMenu();
      }
    });
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }
}
