// Phone (WhatsApp) login needs an SMS provider on the server, which isn't wired
// up yet; until then sign-up and login are email only. Same flag as the app.
export const PHONE_LOGIN_ENABLED = false;
export const DEFAULT_CONTACT_METHOD: 'whatsapp' | 'email' = PHONE_LOGIN_ENABLED ? 'whatsapp' : 'email';
