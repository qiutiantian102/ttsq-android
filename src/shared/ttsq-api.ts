// TTSQ shared API client — platform-agnostic.
// Works in React Native, Taro/WeChat mini program, and web.
// No DOM / localStorage dependencies. Mirrored from app/src/lib/api.ts.

import type {
  MusicShare, MoodCheckin, Poll, Activity, GameScore, DailyCheckinInfo,
  CheckinLeaderEntry, QAQuestion, QAAnswer, GalleryPhoto, BirthdayUser, Creature,
} from './types';

// ---------------------------------------------------------------------------
// Transport layer (pluggable so it works on every platform)
// ---------------------------------------------------------------------------
export interface TransportResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
}

export type Transport = (
  url: string,
  init?: { method?: string; body?: string; headers?: Record<string, string> }
) => Promise<TransportResponse>;

// Default transport uses the global fetch (React Native + web).
const defaultFetchTransport: Transport = async (url, init) => {
  const res = await fetch(url, {
    method: init?.method ?? 'GET',
    body: init?.body,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  return {
    ok: res.ok,
    status: res.status,
    json: () => res.json(),
  };
};

let transport: Transport = defaultFetchTransport;

/** Inject a platform-specific transport (e.g. Taro.request for WeChat). */
export function setTransport(t: Transport) {
  transport = t;
}

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
const DEFAULT_PROXY = 'https://proxy.qiuht.cn';
const DIRECT_API = 'https://ttsq-api.qiutiantian102.workers.dev/api';

// Mobile apps (React Native / WeChat) default to proxy, because .workers.dev
// is often unreachable inside mainland China without a VPN. The web app already
// defaults to proxy.qiuht.cn/api for the same reason. Override with setApiBase().
// IMPORTANT: the base MUST include the `/api` suffix, otherwise every request
// 404s (the Worker routes are mounted under /api). This matches app/src/lib/api.ts.
let apiBase = DEFAULT_PROXY + '/api';

/** Override the API base (e.g. a custom proxy or self-hosted backend). */
export function setApiBase(url: string) {
  apiBase = url.replace(/\/$/, '').replace(/\/api$/, '') + '/api';
}
export function getApiBase() {
  return apiBase;
}

export const API_TIMEOUT = 10000;

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(endpoint: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), API_TIMEOUT) : null;
  try {
    const res = await transport(`${apiBase}${endpoint}`, {
      method: options.method ?? 'GET',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err && err.error) msg = err.error;
      } catch { /* ignore */ }
      throw new ApiError(msg, res.status);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (timeoutId) clearTimeout(timeoutId);
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === 'AbortError') throw new Error('请求超时，请检查网络连接');
    throw e;
  }
}

// ---------------------------------------------------------------------------
// API surface (mirrors app/src/lib/api.ts)
// ---------------------------------------------------------------------------
export const api = {
  users: {
    list: (actorId?: string) =>
      apiFetch<any[]>(actorId ? `/users?actorId=${encodeURIComponent(actorId)}` : '/users'),
    create: (username: string, password: string, role: 'user' | 'admin' = 'user', birthday?: string | null, gender?: string | null, captchaToken?: string) =>
      apiFetch<{ success: boolean; user: any }>(
        '/users',
        { method: 'POST', body: { username, password, role, birthday, gender, captchaToken } }
      ),
    getById: (id: string) => apiFetch<any>(`/users/${id}`),
    getByUsername: (username: string) => apiFetch<any>(`/users/username/${encodeURIComponent(username)}`),
    update: (id: string, updates: { role?: string; bio?: string; gender?: string; birthday?: string; avatar?: string; statusType?: string; statusText?: string }, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/users/${id}`, { method: 'PUT', body: { ...updates, actorId } }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/users/${id}?actorId=${encodeURIComponent(actorId || '')}`, { method: 'DELETE' }),
    birthdays: () => apiFetch<{ items: BirthdayUser[]; serverDate: string }>('/users/birthdays'),
  },

  auth: {
    login: (username: string, password: string, captchaToken?: string) =>
      apiFetch<any>('/auth', { method: 'POST', body: { username, password, captchaToken } }),
  },

  heartbeat: {
    ping: (userId: string) => apiFetch<{ success: boolean; timestamp: string }>('/heartbeat', { method: 'POST', body: { userId } }),
  },

  online: {
    getUsers: () => apiFetch<string[]>('/users/online'),
  },

  chat: {
    getMessages: (limit = 100) => apiFetch<any[]>(`/chat?limit=${limit}`),
    sendMessage: (userId: string, username: string, content: string, actorId?: string) =>
      apiFetch<any>('/chat', { method: 'POST', body: { userId, username, content, actorId } }),
  },

  settings: {
    get: () => apiFetch<any>('/settings'),
    update: (settings: any, actorId?: string) =>
      apiFetch<{ success: boolean }>('/settings', { method: 'PUT', body: { ...settings, actorId } }),
  },

  announcements: {
    list: () => apiFetch<any[]>('/announcements'),
    create: (data: { title: string; content: string; createdBy: string; actorId?: string }) =>
      apiFetch<any>('/announcements', { method: 'POST', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/announcements/${id}?actorId=${encodeURIComponent(actorId || '')}`, { method: 'DELETE' }),
  },

  creatures: {
    list: () => apiFetch<Creature[]>('/creatures'),
    create: (data: { name: string; category: string; description: string; imageUrl?: string }, actorId?: string) =>
      apiFetch<Creature>(`/creatures?actorId=${encodeURIComponent(actorId || '')}`, { method: 'POST', body: data }),
    update: (id: string, data: any, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/creatures/${id}?actorId=${encodeURIComponent(actorId || '')}`, { method: 'PUT', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/creatures/${id}?actorId=${encodeURIComponent(actorId || '')}`, { method: 'DELETE' }),
  },

  messages: {
    getConversations: (userId: string) => apiFetch<any[]>(`/messages/conversations?userId=${userId}`),
    getPrivate: (userId: string, partnerId: string) =>
      apiFetch<any[]>(`/messages/private?userId=${userId}&partnerId=${partnerId}`),
    sendPrivate: (data: { senderId: string; senderName: string; receiverId: string; receiverName: string; content: string; actorId?: string }) =>
      apiFetch<any>('/messages/private', { method: 'POST', body: data }),
    deletePrivate: (id: string, actorId: string) =>
      apiFetch<{ success: boolean; id: string }>(`/messages/private/${encodeURIComponent(id)}`, { method: 'DELETE', body: { actorId } }),
    getUnread: (userId: string) => apiFetch<any[]>(`/messages/unread?userId=${userId}`),
    searchUser: (username: string) => apiFetch<Array<{ id: string; username: string }>>(`/messages/search?username=${encodeURIComponent(username)}`),
  },

  groups: {
    list: (userId?: string) => apiFetch<any[]>(userId ? `/groups?userId=${userId}` : '/groups'),
    create: (data: { name: string; description?: string; creatorId: string; creatorName: string }) =>
      apiFetch<any>('/groups', { method: 'POST', body: data }),
    join: (groupId: string, userId: string, username: string) =>
      apiFetch<{ success: boolean }>(`/groups/${groupId}/members`, { method: 'POST', body: { userId, username } }),
    getMembers: (groupId: string) => apiFetch<any[]>(`/groups/${groupId}/members`),
    getMessages: (groupId: string, limit = 100) => apiFetch<any[]>(`/groups/${groupId}/messages?limit=${limit}`),
    sendMessage: (groupId: string, data: { senderId: string; username: string; content: string; actorId?: string }) =>
      apiFetch<any>(`/groups/${groupId}/messages`, { method: 'POST', body: data }),
    deleteMessage: (groupId: string, messageId: string, actorId: string) =>
      apiFetch<{ success: boolean; id: string }>(`/groups/${groupId}/messages/${encodeURIComponent(messageId)}`, { method: 'DELETE', body: { actorId } }),
    delete: (groupId: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/groups/${groupId}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  posts: {
    list: () => apiFetch<any[]>('/posts'),
    getById: (id: string) => apiFetch<any>(`/posts/${id}`),
    create: (data: { title: string; content: string; imageUrl?: string; authorId: string; authorName: string; actorId?: string }) =>
      apiFetch<any>('/posts', { method: 'POST', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/posts/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
    getComments: (postId: string) => apiFetch<any[]>(`/posts/${postId}/comments`),
    addComment: (postId: string, data: { authorId: string; authorName: string; content: string; actorId?: string }) =>
      apiFetch<any>(`/posts/${postId}/comments`, { method: 'POST', body: data }),
    toggleLike: (postId: string, userId: string) =>
      apiFetch<{ liked: boolean }>(`/posts/${postId}/like`, { method: 'POST', body: { userId } }),
    checkLike: (postId: string, userId: string) =>
      apiFetch<{ liked: boolean }>(`/posts/${postId}/like?userId=${userId}`),
  },

  links: {
    list: () => apiFetch<any[]>('/links'),
    create: (data: { name: string; url: string; description?: string; createdBy: string }) =>
      apiFetch<any>('/links', { method: 'POST', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/links/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  music: {
    list: () => apiFetch<MusicShare[]>('/music'),
    create: (data: { title: string; url: string; artist?: string; platform?: string; coverUrl?: string; createdBy: string }) =>
      apiFetch<MusicShare>('/music', { method: 'POST', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/music/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  qa: {
    list: () => apiFetch<QAQuestion[]>('/qa'),
    create: (data: { title: string; content: string; userId: string; username: string; actorId?: string }) =>
      apiFetch<QAQuestion>('/qa', { method: 'POST', body: data }),
    answers: (questionId: string) => apiFetch<QAAnswer[]>(`/qa/${questionId}/answers`),
    answer: (questionId: string, data: { content: string; userId: string; username: string; actorId?: string }) =>
      apiFetch<QAAnswer>(`/qa/${questionId}/answers`, { method: 'POST', body: data }),
    deleteQuestion: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/qa/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
    deleteAnswer: (questionId: string, answerId: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/qa/${questionId}/answers/${answerId}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  gallery: {
    list: () => apiFetch<GalleryPhoto[]>('/gallery'),
    create: (data: { imageUrl: string; caption?: string; userId: string; username: string }) =>
      apiFetch<GalleryPhoto>('/gallery', { method: 'POST', body: data }),
    remove: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/gallery/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  mood: {
    list: () => apiFetch<MoodCheckin[]>('/mood'),
    create: (data: { emoji: string; text?: string; userId: string; username: string; actorId?: string }) =>
      apiFetch<MoodCheckin>('/mood', { method: 'POST', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/mood/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  poll: {
    list: (userId?: string) => apiFetch<Poll[]>(userId ? `/polls?userId=${encodeURIComponent(userId)}` : '/polls'),
    create: (data: { question: string; options: string[]; createdBy: string; username: string }) =>
      apiFetch<Poll>('/polls', { method: 'POST', body: data }),
    vote: (id: string, userId: string, optionIndex: number) =>
      apiFetch<{ success: boolean }>(`/polls/${id}/vote`, { method: 'POST', body: { userId, optionIndex } }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/polls/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  activity: {
    list: (userId?: string) => apiFetch<Activity[]>(userId ? `/activities?userId=${encodeURIComponent(userId)}` : '/activities'),
    create: (data: { title: string; description: string; creatorId: string; creatorName: string }) =>
      apiFetch<Activity>('/activities', { method: 'POST', body: data }),
    checkin: (id: string, userId: string, username: string, note?: string) =>
      apiFetch<{ success: boolean; checkedIn: boolean; checkinCount: number; participants: string[] }>(
        `/activities/${id}/checkin`,
        { method: 'POST', body: { userId, username, note: note || '' } }
      ),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/activities/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  notes: {
    list: (userId: string) => apiFetch<any[]>(`/notes?userId=${userId}`),
    create: (data: { authorId: string; authorName: string; content: string; visibility: { type: string; usernames?: string[] } }) =>
      apiFetch<any>('/notes', { method: 'POST', body: data }),
    updateVisibility: (noteId: string, data: { type: string; usernames?: string[] }) =>
      apiFetch<{ success: boolean }>(`/notes/${noteId}/visibility`, { method: 'PUT', body: data }),
    delete: (id: string, actorId?: string) =>
      apiFetch<{ success: boolean }>(`/notes/${id}${actorId ? `?actorId=${actorId}` : ''}`, { method: 'DELETE' }),
  },

  turkeyConfig: {
    get: () => apiFetch<any>('/turkey-config'),
    update: (data: any, actorId?: string) => apiFetch<{ success: boolean }>('/turkey-config', { method: 'PUT', body: { ...data, actorId } }),
  },

  game: {
    leaderboard: (game: string, scope: 'daily' | 'all' = 'daily') =>
      apiFetch<{ scope: string; date?: string; scores: GameScore[] }>(
        `/game/leaderboard?game=${encodeURIComponent(game)}&scope=${scope}`
      ),
    submitScore: (data: { game: string; userId: string; username: string; score: number; timeMs: number }) =>
      apiFetch<{ success: boolean; score: number; date: string; rank: number | null }>('/game/score', { method: 'POST', body: data }),
  },

  checkin: {
    mine: (userId: string) => apiFetch<DailyCheckinInfo>(`/checkin/mine?userId=${encodeURIComponent(userId)}`),
    leaderboard: (scope: 'streak' | 'total' = 'streak') =>
      apiFetch<{ scope: string; scores: CheckinLeaderEntry[] }>(`/checkin/leaderboard?scope=${scope}`),
    checkIn: (data: { userId: string; username: string }) =>
      apiFetch<{ success: boolean; already: boolean; checkedToday: boolean; streak: number; total: number }>('/checkin', { method: 'POST', body: data }),
  },
};

export { ApiError };
export default api;
