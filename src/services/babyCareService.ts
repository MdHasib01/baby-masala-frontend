/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Baby Care Service Layer — backed by the Express + MongoDB API in /backend.
 *
 * Actions with business rules (points, stock, eligibility) are separate
 * endpoints so the server enforces them. Lists the user simply owns
 * (children, friends, messenger, doctor questions) are synced whole.
 */

import {
  User,
  Complaint,
  ReactionType,
  ComplaintCategory,
  ComplaintStatus,
  Child,
  Post,
  Comment,
  Recipe,
  Contest,
  ContestSubmission,
  Product,
  CartItem,
  Order,
  RewardTransaction,
  GiftItem,
  GiftRedemption,
  NotificationItem,
  FriendUser,
  Conversation,
  Message,
  Doctor,
  DoctorQuestion,
  LeaderboardEntry,
  DeliveryArea,
  ShopInfo,
} from '../types';
import { apiRequest, tokenStore } from './api';

export type AuthState = 'welcome' | 'signup' | 'login' | 'verify' | 'app';

/** Lists the client owns and syncs with PUT /api/sync/:collection. */
export type SyncedCollection = 'children' | 'friends' | 'conversations' | 'messages' | 'doctorQuestions';

export interface BootstrapData {
  user: User;
  children: Child[];
  posts: Post[];
  comments: Comment[];
  recipes: Recipe[];
  products: Product[];
  contests: Contest[];
  submissions: ContestSubmission[];
  gifts: GiftItem[];
  orders: Order[];
  rewardTx: RewardTransaction[];
  giftRedemptions: GiftRedemption[];
  notifications: NotificationItem[];
  cart: CartItem[];
  friends: FriendUser[];
  conversations: Conversation[];
  messages: Message[];
  doctors: Doctor[];
  doctorQuestions: DoctorQuestion[];
  leaderboard: LeaderboardEntry[];
  /** Store delivery charges; missing on older servers. */
  shop?: ShopInfo;
}

export interface AdminStats {
  /** Real (non-AI) accounts. */
  users: number;
  newUsers7d: number;
  aiPersonas: number;
  posts: number;
  posts7d: number;
  orders: number;
  ordersByStatus: Record<Order['status'], number>;
  /** Sum of non-cancelled orders, in taka. */
  revenue: number;
  openComplaints: number;
  pendingSubmissions: number;
}

export interface AdminOverview {
  posts: (Post & { reportsCount: number })[];
  orders: (Order & { userId: string })[];
  products: Product[];
  submissions: ContestSubmission[];
  complaints: Complaint[];
  /** Missing on older servers. */
  contests?: Contest[];
  stats?: AdminStats;
}

type WithReward<T> = T & { rewardTx: RewardTransaction | null };

const AUTH_STATE_KEY = 'babycare_auth_state';

const post = <T>(path: string, body: unknown = {}) => apiRequest<T>(path, { method: 'POST', body });
const patch = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PATCH', body });
const put = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT', body });
const del = <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
const id = encodeURIComponent;

export const babyCareService = {
  // ---- Session & onboarding (screen position is UI state, kept locally) ----
  getAuthState: (): AuthState => {
    try {
      return (localStorage.getItem(AUTH_STATE_KEY) as AuthState) || 'welcome';
    } catch {
      return 'welcome';
    }
  },
  setAuthState: (state: AuthState) => {
    try {
      localStorage.setItem(AUTH_STATE_KEY, state);
    } catch {
      /* ignore */
    }
  },
  hasSession: () => Boolean(tokenStore.get()),
  logout: () => {
    tokenStore.clear();
    babyCareService.setAuthState('welcome');
  },

  login: async (contact: string, password: string) => {
    const res = await post<{ token: string; user: User; isNewUser: boolean }>('/auth/login', { contact, password });
    tokenStore.set(res.token);
    return res;
  },
  /** Signup sends the chosen password too; it is set once the email code is verified. */
  requestOtp: (payload: { contact: string; mode: 'signup' | 'login'; name?: string; password?: string }) =>
    post<{ ok: true; contact: string; expiresInSeconds: number }>('/auth/request-otp', payload),
  verifyOtp: async (contact: string, code: string) => {
    const res = await post<{ token: string; user: User; isNewUser: boolean }>('/auth/verify-otp', { contact, code });
    tokenStore.set(res.token);
    return res;
  },
  activateMembership: (couponCode: string) => post<{ user: User }>('/auth/activate-membership', { couponCode }),

  // ---- Initial load ----
  bootstrap: () => apiRequest<BootstrapData>('/bootstrap'),

  // ---- Profile, cart, notifications ----
  updateProfile: (user: User) =>
    patch<{ user: User }>('/me', {
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      coverPhoto: user.coverPhoto,
      location: user.location,
      dateOfBirth: user.dateOfBirth,
      addresses: user.addresses,
      notificationPrefs: user.notificationPrefs,
      privacySettings: user.privacySettings,
    }),
  saveCart: (cart: CartItem[]) =>
    put<{ cart: CartItem[] }>('/me/cart', {
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    }),
  markAllNotificationsRead: () => post<{ ok: true }>('/notifications/read-all'),

  // ---- Community ----
  createPost: (data: { content: string; topic: Post['topic']; mediaUrl?: string }) =>
    post<WithReward<{ post: Post }>>('/posts', data),
  updatePost: (postId: string, data: { content?: string; topic?: Post['topic']; mediaUrl?: string }) =>
    patch<{ post: Post }>(`/posts/${id(postId)}`, data),
  deletePost: (postId: string) => del<{ ok: true }>(`/posts/${id(postId)}`),
  /** Same type again removes the reaction; another type switches. */
  reactToPost: (postId: string, type: ReactionType = 'like') =>
    post<WithReward<{ post: Post }>>(`/posts/${id(postId)}/react`, { type }),
  toggleSavePost: (postId: string) => post<{ post: Post }>(`/posts/${id(postId)}/save`),
  hidePost: (postId: string) => post<{ ok: true }>(`/posts/${id(postId)}/hide`),
  reportPost: (postId: string, reason?: string) => post<{ ok: true }>(`/posts/${id(postId)}/report`, { reason }),
  addComment: (postId: string, content: string, parentId?: string) =>
    post<WithReward<{ comment: Comment; post: Post }>>(`/posts/${id(postId)}/comments`, { content, parentId }),

  // ---- Recipes ----
  toggleSaveRecipe: (recipeId: string) => post<{ recipe: Recipe }>(`/recipes/${id(recipeId)}/save`),

  // ---- Shop ----
  placeOrder: (data: {
    cart: CartItem[];
    customerName: string;
    phone: string;
    area: DeliveryArea;
    shippingAddress: string;
    notes?: string;
  }) =>
    post<WithReward<{ order: Order; products: Product[] }>>('/orders', {
      items: data.cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      customerName: data.customerName,
      phone: data.phone,
      area: data.area,
      shippingAddress: data.shippingAddress,
      notes: data.notes,
      paymentMethod: 'cod',
    }),

  // ---- Rewards & contests ----
  getLeaderboard: () => apiRequest<{ leaderboard: LeaderboardEntry[] }>('/rewards/leaderboard'),
  redeemGift: (giftId: string, deliveryAddress: string) =>
    post<{
      redemption: GiftRedemption;
      rewardTx: RewardTransaction;
      gift: GiftItem;
      earnedPoints: number;
      spentPoints: number;
      availablePoints: number;
    }>('/rewards/redeem', { giftId, deliveryAddress }),
  submitContestEntry: (contestId: string, data: { description: string; mediaUrl?: string; orderId?: string }) =>
    post<WithReward<{ submission: ContestSubmission }>>(`/contests/${id(contestId)}/submissions`, data),

  // ---- Complaints ----
  myComplaints: () => apiRequest<{ complaints: Complaint[] }>('/complaints'),
  createComplaint: (data: { category: ComplaintCategory; details: string; attachmentUrl?: string }) =>
    post<{ complaint: Complaint }>('/complaints', data),

  // ---- Synced per-user lists ----
  syncCollection: (collection: SyncedCollection, items: { id: string }[]) =>
    put<{ ok: true; count: number }>(`/sync/${collection}`, { items }),

  // ---- Admin ----
  admin: {
    overview: () => apiRequest<AdminOverview>('/admin/overview'),
    deletePost: (postId: string) => del<{ ok: true }>(`/admin/posts/${id(postId)}`),
    updatePostStatus: (postId: string, status: Post['status']) =>
      patch<{ post: Post }>(`/admin/posts/${id(postId)}`, { status }),
    updateOrderStatus: (orderId: string, status: Order['status']) =>
      patch<WithReward<{ order: Order }>>(`/admin/orders/${id(orderId)}`, { status }),
    updateProduct: (productId: string, data: { stock?: number; price?: number }) =>
      patch<{ product: Product }>(`/admin/products/${id(productId)}`, data),
    updateComplaint: (complaintId: string, data: { status?: ComplaintStatus; adminReply?: string }) =>
      patch<{ complaint: Complaint }>(`/admin/complaints/${id(complaintId)}`, data),
    updateSubmission: (submissionId: string, status: ContestSubmission['status']) =>
      patch<{ submission: ContestSubmission }>(`/admin/submissions/${id(submissionId)}`, { status }),

    // Labeled AI personas (backend calls node-agent; its token never reaches the browser).
    ai: {
      status: () => apiRequest<AiStatus>('/admin/ai/status'),
      personas: (active?: boolean) =>
        apiRequest<{ personas: AiPersona[]; total: number }>(
          `/admin/ai/personas${active === undefined ? '' : `?active=${active}`}`
        ),
      personaStyles: () => apiRequest<{ groups: AiStyleGroup[]; minPerGroup: number }>('/admin/ai/persona-styles'),
      generatePersonas: (count: number, guidance?: string, styles?: AiStyles) =>
        post<{ batch: AiBatch }>('/admin/ai/personas/generate', {
          count,
          ...(guidance ? { guidance } : {}),
          ...(styles ? { styles } : {}),
        }),
      batches: () => apiRequest<{ batches: AiBatch[]; generating: boolean }>('/admin/ai/batches'),
      batch: (batchId: string) => apiRequest<{ batch: AiBatch }>(`/admin/ai/batches/${id(batchId)}`),
      regeneratePhoto: (personaId: string) => post<{ persona: AiPersona }>(`/admin/ai/personas/${id(personaId)}/photo`),
      createPersona: (data: AiPersonaInput) => post<{ persona: AiPersona }>('/admin/ai/personas', data),
      updatePersona: (personaId: string, data: Partial<AiPersonaInput>) =>
        patch<{ persona: AiPersona }>(`/admin/ai/personas/${id(personaId)}`, data),
      deletePersona: (personaId: string) => del<{ ok: true }>(`/admin/ai/personas/${id(personaId)}`),
      postNow: (personaId: string, opts: { topic?: string; withImage?: boolean } = {}) =>
        post<{ post: Post; imageError: string | null }>(`/admin/ai/personas/${id(personaId)}/post-now`, opts),
      replyTo: (postId: string, personaId?: string) =>
        post<{ comment: Comment }>(`/admin/ai/reply/${id(postId)}`, personaId ? { personaId } : {}),
      // Admin → AI টাস্ক: automatic posts, comment batches and reactions.
      tasks: {
        get: () => apiRequest<{ settings: AiTaskSettings; scheduler: AiSchedulerState; runs: AiRun[] }>('/admin/ai/tasks'),
        update: (changes: AiTaskSettingsPatch) =>
          patch<{ settings: AiTaskSettings; scheduler: AiSchedulerState }>('/admin/ai/tasks', changes),
        run: (task: AiTaskKey) => post<{ run: AiRun; scheduler: AiSchedulerState }>(`/admin/ai/tasks/${task}/run`),
      },
      /** CLIs and models live from node-agent (cached 5 min on the server; `refresh` re-reads). */
      models: (refresh = false) => apiRequest<AiModelCatalog>(`/admin/ai/models${refresh ? '?refresh=1' : ''}`),
    },
  },
};

export interface AiPersona {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  voice: string;
  focusTopics: string[];
  active: boolean;
  lastPostAt: string | null;
  location?: string;
}

export interface AiBatchItem {
  index: number;
  status: 'pending' | 'profile' | 'photo' | 'done' | 'failed' | 'skipped';
  name?: string;
  avatar?: string;
  userId?: string;
  error?: string;
  /** This user's style mix: group id -> option id. */
  combo?: Record<string, string>;
}

/** Style groups for the AI user generator (backend looks.js STYLE_GROUPS). */
export interface AiStyleGroup {
  id: string;
  label: string;
  options: { id: string; label: string }[];
}

/** Selected option ids per style group. */
export type AiStyles = Record<string, string[]>;

export interface AiBatch {
  id: string;
  requested: number;
  guidance: string;
  styles?: AiStyles | null;
  status: 'queued' | 'running' | 'done' | 'stopped';
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  done: number;
  failed: number;
  error: string | null;
  items: AiBatchItem[];
}

export interface AiPersonaInput {
  name: string;
  avatar?: string;
  bio?: string;
  voice?: string;
  focusTopics?: string[];
  active?: boolean;
}

export interface AiRun {
  id?: string;
  at: string;
  what: 'post' | 'reply' | 'comment' | 'like';
  persona?: string;
  /** AI users who took part (comment batches, reactions). */
  personas?: string[];
  ok: boolean;
  error?: string;
  note?: string;
  count?: number;
  postId?: string;
  topic?: string;
  /** The post went up with a generated photo. */
  withImage?: boolean;
  manual?: boolean;
}

export type AiTaskKey = 'post' | 'comment' | 'like';

/** A node-agent CLI + model; empty strings mean node-agent's own default. */
export interface AiModelChoice {
  cli: string;
  model: string;
}

export interface AiTaskSettings {
  autoEnabled: boolean;
  activeHours: { start: number; end: number };
  post: {
    enabled: boolean;
    minMinutes: number;
    maxMinutes: number;
    imagePercent: number;
    textModel: AiModelChoice;
    imageModel: AiModelChoice;
  };
  comment: {
    enabled: boolean;
    minMinutes: number;
    maxMinutes: number;
    minCount: number;
    maxCount: number;
    recentPosts: number;
    maxAiCommentsPerPost: number;
    includeAiPosts: boolean;
    /** Weights for each comment length: 1-3 word reaction, one line, 1-2 sentences, 2-4 sentences. */
    lengthMix: { reaction: number; short: number; medium: number; long: number };
    model: AiModelChoice;
  };
  like: {
    enabled: boolean;
    minMinutes: number;
    maxMinutes: number;
    minCount: number;
    maxCount: number;
    recentPosts: number;
    reactionMix: { like: number; love: number; care: number; haha: number };
  };
  persona: { profileModel: AiModelChoice; portraitModel: AiModelChoice };
}

export type AiTaskSettingsPatch = Partial<{
  [K in keyof AiTaskSettings]: AiTaskSettings[K] extends object ? Partial<AiTaskSettings[K]> : AiTaskSettings[K];
}>;

export interface AiTaskState {
  enabled: boolean;
  scheduled: boolean;
  nextRunAt: string | null;
  busy: boolean;
  pausedUntil: string | null;
}

export interface AiSchedulerState {
  autoEnabled: boolean;
  activeHours: { start: number; end: number };
  inActiveHours: boolean;
  tasks: Record<AiTaskKey, AiTaskState>;
}

export interface AiCliModels {
  cli: string;
  label: string;
  vendor: string | null;
  /** node-agent's last health check; null = not checked yet. */
  available: boolean | null;
  auth: string;
  /** 'cli' = listed by the CLI itself, 'aliases' = fixed list, 'fallback' / 'error' = listing failed. */
  source: 'cli' | 'aliases' | 'fallback' | 'error';
  warning: string | null;
  models: { id: string; label: string; description?: string | null }[];
}

export interface AiModelCatalog {
  /** node-agent's own default CLI and model, used when a task has no choice. */
  defaults: { cli: string | null; model: string } | null;
  clis: AiCliModels[];
  refreshedAt: string;
}

export interface AiStatus {
  agent: {
    configured: boolean;
    reachable: boolean;
    tokenOk?: boolean;
    latencyMs?: number;
    clis?: string[];
    message?: string;
  };
  scheduler: AiSchedulerState;
  generating: boolean;
  counts: { personas: number; aiPosts: number; aiComments: number };
  runs: AiRun[];
}
