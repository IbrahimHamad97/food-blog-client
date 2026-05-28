/**
 * Authenticated user returned by the API (`GET /auth/me`, sign-in response).
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

/** localStorage key for the JWT returned after Google sign-in. */
export const AUTH_TOKEN_KEY = 'food-blog-auth-token';
