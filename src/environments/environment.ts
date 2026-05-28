/**
 * Dev environment values — replace in production build pipeline.
 * `googleClientId` must match `GOOGLE_CLIENT_ID` in food-blog-server `.env`.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  googleClientId: '603404766692-q5oe06jbcvspsbo810po66dm2u9jla38.apps.googleusercontent.com',
};
