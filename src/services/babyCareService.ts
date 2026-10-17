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
} from '../types';
import { apiRequest, tokenStore } from './api';

export type AuthState = 'welcome' | 'signup' | 'login' | 'verify' | 'membership' | 'app';

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
}

export interface AdminOverview {
  posts: (Post & { reportsCount: number })[];
  orders: (Order & { userId: string })[];
  products: Product[];
  submissions: ContestSubmission[];
  complaints: Complaint[];
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

  requestOtp: (payload: { contact: string; mode: 'signup' | 'login'; name?: string }) =>
    post<{ ok: true; contact: string; expiresInSeconds: number }>('/auth/request-otp', payload),
  verifyOtp: async (contact: string, code: string) => {
    const res = await post<{ token: string; user: User; isNewUser: boolean }>('/auth/verify-otp', { contact, code });
    tokenStore.set(res.token);
    return res;
  },
  activateMembership: (couponCode: string) => post<{ user: User }>('/auth/activate-membership', { couponCode }),
  demoPurchaseMembership: () => post<{ user: User }>('/auth/demo-purchase'),

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
  reactToPost: (postId: string) => post<WithReward<{ post: Post }>>(`/posts/${id(postId)}/react`),
  toggleSavePost: (postId: string) => post<{ post: Post }>(`/posts/${id(postId)}/save`),
  hidePost: (postId: string) => post<{ ok: true }>(`/posts/${id(postId)}/hide`),
  reportPost: (postId: string, reason?: string) => post<{ ok: true }>(`/posts/${id(postId)}/report`, { reason }),
  addComment: (postId: string, content: string) =>
    post<WithReward<{ comment: Comment; post: Post }>>(`/posts/${id(postId)}/comments`, { content }),

  // ---- Recipes ----
  toggleSaveRecipe: (recipeId: string) => post<{ recipe: Recipe }>(`/recipes/${id(recipeId)}/save`),

  // ---- Shop ----
  placeOrder: (data: { cart: CartItem[]; shippingAddress: string; notes?: string; paymentMethod: 'cod' | 'online' }) =>
    post<WithReward<{ order: Order; products: Product[] }>>('/orders', {
      items: data.cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      shippingAddress: data.shippingAddress,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
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
    updateOrderStatus: (orderId: string, status: Order['status']) =>
      patch<WithReward<{ order: Order }>>(`/admin/orders/${id(orderId)}`, { status }),
    updateProduct: (productId: string, data: { stock?: number; price?: number }) =>
      patch<{ product: Product }>(`/admin/products/${id(productId)}`, data),
    updateComplaint: (complaintId: string, data: { status?: ComplaintStatus; adminReply?: string }) =>
      patch<{ complaint: Complaint }>(`/admin/complaints/${id(complaintId)}`, data),
  },
};
