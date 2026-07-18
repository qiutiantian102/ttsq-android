// TTSQ shared types — single source of truth for web / React Native / Taro.
// Mirrored from app/src/types/index.ts. Keep in sync.

export type UserRole = 'admin' | 'user';

export interface GameScore {
  user_id: string;
  username: string;
  score: number;
  time_ms: number;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isSuperAdmin: boolean;
  createdAt: string;
  birthday?: string | null;
  gender?: string | null;
  bio?: string | null;
  avatar?: string | null;
  lastLoginIp?: string | null;
  lastLoginLocation?: string | null;
  lastLoginAt?: string | null;
  lastActiveAt?: string | null;
  registerIp?: string | null;
  registerLocation?: string | null;
  registerAt?: string | null;
  statusType?: string | null;
  statusText?: string | null;
}

export const STATUS_TYPES = [
  { id: 'mood', emoji: '💬', label: '心情', placeholder: '此刻心情如何？' },
  { id: 'drama', emoji: '📺', label: '追剧', placeholder: '正在追《》…' },
  { id: 'book', emoji: '📚', label: '读书', placeholder: '在读《》…' },
  { id: 'game', emoji: '🎮', label: '玩游戏', placeholder: '在玩《》…' },
  { id: 'music', emoji: '🎵', label: '听歌', placeholder: '在听《》…' },
  { id: 'sport', emoji: '🏃', label: '运动', placeholder: '在做什么运动？' },
  { id: 'food', emoji: '🍜', label: '美食', placeholder: '在吃什么好吃的？' },
  { id: 'study', emoji: '📖', label: '学习', placeholder: '在学什么？' },
  { id: 'work', emoji: '💼', label: '工作', placeholder: '在忙什么工作？' },
  { id: 'custom', emoji: '✨', label: '自定义', placeholder: '想说点什么？' },
] as const;

export type StatusTypeId = typeof STATUS_TYPES[number]['id'];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface MusicShare {
  id: string;
  title: string;
  artist: string | null;
  url: string;
  platform: string;
  coverUrl: string;
  createdBy: string;
  createdAt: string;
}

export interface QAQuestion {
  id: string;
  title: string;
  content: string;
  userId: string;
  authorName: string;
  createdAt: string;
  answerCount?: number;
}

export interface QAAnswer {
  id: string;
  questionId: string;
  content: string;
  userId: string;
  authorName: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  userId: string;
  authorName: string;
  createdAt: string;
}

export interface BirthdayUser {
  id: string;
  username: string;
  avatar: string | null;
  birthday: string;
  month: number;
  day: number;
  daysUntil: number;
  isToday: boolean;
}

export interface DailyCheckinInfo {
  checkedToday: boolean;
  streak: number;
  total: number;
  lastDate: string | null;
  recent: Array<{ date: string; checked: boolean }>;
  month?: DailyCheckinMonth;
}

export interface DailyCheckinMonthDay {
  day: number;
  date: string;
  checked: boolean;
  future: boolean;
}

export interface DailyCheckinMonth {
  year: number;
  month: number;
  days: DailyCheckinMonthDay[];
}

export interface CheckinLeaderEntry {
  user_id: string;
  username: string;
  value: number;
}

export const MUSIC_PLATFORMS = [
  { id: 'netease', emoji: '🎵', label: '网易云音乐' },
  { id: 'qq', emoji: '🎶', label: 'QQ音乐' },
  { id: 'spotify', emoji: '🌿', label: 'Spotify' },
  { id: 'youtube', emoji: '▶️', label: 'YouTube' },
  { id: 'bilibili', emoji: '📺', label: 'Bilibili' },
  { id: 'other', emoji: '🔗', label: '其它' },
] as const;

export function musicPlatformLabel(id: string): string {
  return MUSIC_PLATFORMS.find((p) => p.id === id)?.label ?? '音乐';
}

export interface MoodCheckin {
  id: string;
  userId: string;
  username: string;
  emoji: string;
  text: string;
  createdAt: string;
}

export const MOOD_EMOJIS = [
  { emoji: '😊', label: '开心' },
  { emoji: '🥰', label: '幸福' },
  { emoji: '😎', label: '酷' },
  { emoji: '🤩', label: '兴奋' },
  { emoji: '🥳', label: '庆祝' },
  { emoji: '😌', label: '平静' },
  { emoji: '🤔', label: '思考' },
  { emoji: '😢', label: '难过' },
  { emoji: '😭', label: '崩溃' },
  { emoji: '😡', label: '生气' },
  { emoji: '😴', label: '困倦' },
  { emoji: '😂', label: '大笑' },
] as const;

export function moodLabel(emoji: string): string {
  return MOOD_EMOJIS.find((m) => m.emoji === emoji)?.label ?? '';
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  createdBy: string;
  username: string;
  createdAt: string;
  totalVotes: number;
  results: Array<{ index: number; label: string; count: number }>;
  votedOption: number | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  checkinCount: number;
  checkedIn: boolean;
  participants: string[];
}

export interface Creature {
  id: string;
  name: string;
  category: string;
  description: string; // Markdown content
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  username: string;
  joinedAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorId: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AppSettings {
  backgroundImage: string | null;
  backgroundType: 'gradient' | 'image' | 'color';
  accentColor: string;
  uiColor: string; // 选项框/导航激活色，默认透明
}

// 97种性别选项
export const GENDER_OPTIONS = [
  { id: 'male', label: '男性', emoji: '♂️' },
  { id: 'female', label: '女性', emoji: '♀️' },
  { id: 'non-binary', label: '非二元性别', emoji: '⚧️' },
  { id: 'genderfluid', label: '性别流动', emoji: '🌊' },
  { id: 'agender', label: '无性别', emoji: '⚪' },
  { id: 'bigender', label: '双性别', emoji: '⚖️' },
  { id: 'pangender', label: '泛性别', emoji: '🌈' },
  { id: 'genderqueer', label: '性别酷儿', emoji: '🏳️‍🌈' },
  { id: 'trans-male', label: '跨性别男性', emoji: '🏳️‍⚧️' },
  { id: 'trans-female', label: '跨性别女性', emoji: '🏳️‍⚧️' },
  { id: 'intersex', label: '双性人', emoji: '☯️' },
  { id: 'two-spirit', label: '双灵人', emoji: '🦋' },
  { id: 'androgyne', label: '雌雄同体', emoji: '🌸' },
  { id: 'neutrois', label: '中性别', emoji: '💜' },
  { id: 'questioning', label: '性别疑问中', emoji: '❓' },
  { id: 'androgynous', label: '中性', emoji: '🌙' },
  { id: 'cis-male', label: '顺性别男性', emoji: '👨' },
  { id: 'cis-female', label: '顺性别女性', emoji: '👩' },
  { id: 'gender-nonconforming', label: '性别不从众', emoji: '🎭' },
  { id: 'gender-variant', label: '性别变异', emoji: '🦄' },
  { id: 'ftm', label: '女转男 (FTM)', emoji: '🔄' },
  { id: 'mtf', label: '男转女 (MTF)', emoji: '🔄' },
  { id: 'demiboy', label: '半男性', emoji: '🌗' },
  { id: 'demigirl', label: '半女性', emoji: '🌓' },
  { id: 'demigender', label: '半性别', emoji: '🌑' },
  { id: 'xenogender', label: '异类性别', emoji: '👽' },
  { id: 'maverique', label: '特立性别', emoji: '⭐' },
  { id: 'novosexual', label: '流变性别', emoji: '✨' },
  { id: 'trigender', label: '三元性别', emoji: '🔺' },
  { id: 'polygender', label: '多元性别', emoji: '💫' },
  { id: 'omnigender', label: '全性别', emoji: '🌀' },
  { id: 'maxigender', label: '极致性别', emoji: '💥' },
  { id: 'aporagender', label: '离异性别', emoji: '🌌' },
  { id: 'autigender', label: '自闭谱系性别', emoji: '🧩' },
  { id: 'butch', label: '阳刚女性', emoji: '💪' },
  { id: 'femme', label: '柔美性别', emoji: '🌺' },
  { id: 'boi', label: '小子性别', emoji: '🎮' },
  { id: 'stud', label: '硬朗性别', emoji: '🔧' },
  { id: 'gender-gifted', label: '性别天赋', emoji: '🎁' },
  { id: 'third-gender', label: '第三性别', emoji: '3️⃣' },
  { id: 'hijra', label: '海吉拉', emoji: '🕌' },
  { id: 'kathoey', label: '卡托伊', emoji: '🌴' },
  { id: 'fa-afafine', label: '法阿法菲内', emoji: '🌺' },
  { id: 'muxe', label: '穆谢', emoji: '🌵' },
  { id: 'sekrata', label: '塞克拉塔', emoji: '🌿' },
  { id: 'waria', label: '瓦里亚', emoji: '🌏' },
  { id: 'travesti', label: '特拉维斯蒂', emoji: '🎪' },
  { id: 'bakla', label: '巴克拉', emoji: '🌺' },
  { id: 'calabai', label: '卡拉拜', emoji: '🏝️' },
  { id: 'calalai', label: '卡拉莱', emoji: '🏝️' },
  { id: 'bissu', label: '比苏', emoji: '⚡' },
  { id: 'winkte', label: '温克特', emoji: '🦅' },
  { id: 'nádleeh', label: '纳德里', emoji: '🌄' },
  { id: 'hemaneh', label: '赫马内', emoji: '🏔️' },
  { id: 'gender-creative', label: '性别创意', emoji: '🎨' },
  { id: 'gender-expansive', label: '性别扩展', emoji: '🚀' },
  { id: 'gender-free', label: '性别自由', emoji: '🕊️' },
  { id: 'gender-independent', label: '性别独立', emoji: '🦁' },
  { id: 'gender-neutral', label: '性别中立', emoji: '⚖️' },
  { id: 'gender-open', label: '性别开放', emoji: '🔓' },
  { id: 'gender-diverse', label: '性别多样', emoji: '🎆' },
  { id: 'transcendent', label: '超越性别', emoji: '🌟' },
  { id: 'omnisexual-gender', label: '泛性向性别', emoji: '🌍' },
  { id: 'intergender', label: '间性别', emoji: '🔗' },
  { id: 'mergender', label: '融合性别', emoji: '🫂' },
  { id: 'epicene', label: '双性共通', emoji: '🤝' },
  { id: 'ambigender', label: '模糊性别', emoji: '🌫️' },
  { id: 'multigender', label: '多重性别', emoji: '🎰' },
  { id: 'voidgender', label: '虚空性别', emoji: '🌑' },
  { id: 'spacegender', label: '宇宙性别', emoji: '🌠' },
  { id: 'stargender', label: '星辰性别', emoji: '⭐' },
  { id: 'lunagender', label: '月亮性别', emoji: '🌙' },
  { id: 'solargender', label: '太阳性别', emoji: '☀️' },
  { id: 'aquagender', label: '水元素性别', emoji: '💧' },
  { id: 'firegender', label: '火元素性别', emoji: '🔥' },
  { id: 'earthgender', label: '土元素性别', emoji: '🌍' },
  { id: 'airgender', label: '风元素性别', emoji: '💨' },
  { id: 'naturegender', label: '自然性别', emoji: '🌿' },
  { id: 'floragender', label: '花朵性别', emoji: '🌸' },
  { id: 'faunagender', label: '动物性别', emoji: '🦊' },
  { id: 'crystalgender', label: '水晶性别', emoji: '💎' },
  { id: 'cloudgender', label: '云朵性别', emoji: '☁️' },
  { id: 'raingender', label: '雨滴性别', emoji: '🌧️' },
  { id: 'snowgender', label: '雪花性别', emoji: '❄️' },
  { id: 'lightgender', label: '光明性别', emoji: '💡' },
  { id: 'shadowgender', label: '阴影性别', emoji: '🌘' },
  { id: 'dreamgender', label: '梦境性别', emoji: '💭' },
  { id: 'mythogender', label: '神话性别', emoji: '🐉' },
  { id: 'magicgender', label: '魔法性别', emoji: '🪄' },
  { id: 'robotgender', label: '机械性别', emoji: '🤖' },
  { id: 'aliengender', label: '外星性别', emoji: '👾' },
  { id: 'glitchgender', label: '故障性别', emoji: '📺' },
  { id: 'pixelgender', label: '像素性别', emoji: '🎮' },
  { id: 'cosmicgender', label: '宇宙意识性别', emoji: '🌌' },
  { id: 'prefer-not-say', label: '不愿透露', emoji: '🔒' },
] as const;

export function genderLabel(id?: string | null): string {
  if (!id) return '';
  return (GENDER_OPTIONS as ReadonlyArray<{ id: string; label: string; emoji: string }>).find((g) => g.id === id)?.label ?? id;
}

export function genderEmoji(id?: string | null): string {
  if (!id) return '';
  return (GENDER_OPTIONS as ReadonlyArray<{ id: string; label: string; emoji: string }>).find((g) => g.id === id)?.emoji ?? '';
}
