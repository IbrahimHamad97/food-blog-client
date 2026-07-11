/**
 * Profile image or two-letter initials when no photo is available.
 */
import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { userInitials } from '../../../core/utils/user.utils';

export type UserAvatarSize = 'xs' | 'sm' | 'lg';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatar {
  readonly name = input.required<string>();
  readonly avatarUrl = input<string | null | undefined>(null);
  readonly size = input<UserAvatarSize>('sm');

  protected readonly imageFailed = signal(false);

  protected readonly initials = computed(() => userInitials(this.name()));

  protected readonly showPhoto = computed(() => !!this.avatarUrl() && !this.imageFailed());

  constructor() {
    effect(() => {
      this.avatarUrl();
      untracked(() => this.imageFailed.set(false));
    });
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
