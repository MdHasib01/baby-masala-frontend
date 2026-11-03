// Phone (WhatsApp) login needs an SMS provider on the server, which isn't wired
// up yet; until then sign-up and login are email only. Same flag as the app.
export const PHONE_LOGIN_ENABLED = false;
export const DEFAULT_CONTACT_METHOD: 'whatsapp' | 'email' = PHONE_LOGIN_ENABLED ? 'whatsapp' : 'email';

// Android app download. The APK is served from public/ (BabyCare.apk); set
// VITE_APP_DOWNLOAD_URL to point at a CDN / Play Store link instead.
// Keep APP_VERSION in step with mobile/pubspec.yaml; it is also added to the
// download URL so browsers and CDNs fetch the new APK instead of a cached one.
export const APP_VERSION = '1.0.2';
export const APP_DOWNLOAD_URL =
  (import.meta.env.VITE_APP_DOWNLOAD_URL as string | undefined)?.trim() || `/BabyCare.apk?v=${APP_VERSION}`;
export const APP_DOWNLOAD_FILENAME = 'BabyCare.apk';
export const APP_SIZE_LABEL = '৫৬ MB';
