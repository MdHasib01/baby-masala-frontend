/**
 * Resolves the backend API base URL:
 * - If VITE_API_URL is set, respects that override.
 * - If running on HTTPS (production/web) or babymasalabd.com, uses https://babymasalabd.com/api
 * - If running locally (localhost, 127.0.0.1, or local network), uses http://localhost:5000/api
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) {
    const trimmed = envUrl.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;

    // Web version on HTTPS or babymasalabd.com domain
    if (protocol === 'https:' || hostname === 'babymasalabd.com' || hostname.endsWith('.babymasalabd.com')) {
      return 'https://babymasalabd.com/api';
    }

    // Local development (localhost, 127.0.0.1, or local domain)
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')
    ) {
      return 'http://localhost:5000/api';
    }

    // Local network access over HTTP (e.g. mobile testing on LAN)
    if (protocol === 'http:' && hostname) {
      return `http://${hostname}:5000/api`;
    }
  }

  return 'http://localhost:5000/api';
}

export const API_BASE = getApiBaseUrl();
const TOKEN_KEY = 'babycare_token';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

let unauthorizedHandler: (() => void) | null = null;

/** Called when the server rejects the token, so the app can return to the welcome screen. */
export const onUnauthorized = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = getApiBaseUrl().replace(/\/$/, '');
  let subPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/api') && (subPath === '/api' || subPath.startsWith('/api/'))) {
    subPath = subPath.slice(4) || '/';
  }
  const url = `${base}${subPath}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করুন।', 'NETWORK');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }
    throw new ApiError(res.status, data?.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।', data?.code);
  }
  return data as T;
}

/** Startup (bootstrap) failures other than "no internet" — usually the server is restarting during a deploy. */
export const UPDATING_MESSAGE = 'অ্যাপটি এই মুহূর্তে আপডেট হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
