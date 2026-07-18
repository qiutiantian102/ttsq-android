// 版本检测工具：读取当前 APP 版本、与后端返回的最新版本比较。
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './ttsq-api';

// 兜底版本号（正常情况下由 expo-constants 从 app.json 读取，这里仅作最后的保底）
const FALLBACK_APP_VERSION = '1.0.1';

export const CURRENT_APP_VERSION: string =
  (Constants.expoConfig?.version as string | undefined) ||
  (Constants.manifest?.version as string | undefined) ||
  FALLBACK_APP_VERSION;

const DISMISS_KEY = 'ttsq_dismissed_version';

export interface UpdateInfo {
  version: string;
  releaseUrl: string;
  downloadUrl: string;
  publishedAt: string;
  notes: string;
}

export function compareVersions(a: string, b: string): number {
  const pa = (a || '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = (b || '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export async function fetchLatestVersion(): Promise<UpdateInfo> {
  return api.appVersion();
}

export interface CheckResult {
  updateAvailable: boolean;
  current: string;
  latest: string;
  info: UpdateInfo | null;
}

export async function checkForUpdate(): Promise<CheckResult> {
  try {
    const info = await fetchLatestVersion();
    if (!info || !info.version) {
      return { updateAvailable: false, current: CURRENT_APP_VERSION, latest: '', info: null };
    }
    const updateAvailable = compareVersions(info.version, CURRENT_APP_VERSION) > 0;
    return { updateAvailable, current: CURRENT_APP_VERSION, latest: info.version, info };
  } catch {
    return { updateAvailable: false, current: CURRENT_APP_VERSION, latest: '', info: null };
  }
}

export async function getDismissedVersion(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

export async function dismissVersion(v: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISS_KEY, v);
  } catch {
    /* ignore */
  }
}
