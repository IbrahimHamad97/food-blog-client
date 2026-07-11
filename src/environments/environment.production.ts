/**
 * Production environment values — used for `ng build` (production config).
 * Set `apiBaseUrl` to your deployed API origin + `/api`.
 * `googleClientId` must match `GOOGLE_CLIENT_ID` in the deployed server `.env`.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://food-blog-server-production.up.railway.app/api',
  googleClientId: '603404766692-q5oe06jbcvspsbo810po66dm2u9jla38.apps.googleusercontent.com',
};
