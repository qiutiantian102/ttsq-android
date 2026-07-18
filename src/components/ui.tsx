import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet,
} from 'react-native';
import { theme, styles } from '../theme';

export const Screen: React.FC<{ children: React.ReactNode; padded?: boolean }> = ({ children, padded }) => (
  <View style={[styles.container, padded && { padding: 16 }]}>
    {children}
  </View>
);

export const Card: React.FC<{ children: React.ReactNode; onPress?: () => void }> = ({ children, onPress }) =>
  onPress ? (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {children}
    </TouchableOpacity>
  ) : (
    <View style={styles.card}>{children}</View>
  );

export const Button: React.FC<{ title: string; onPress?: () => void; disabled?: boolean; secondary?: boolean }> = ({
  title, onPress, disabled, secondary,
}) => (
  <TouchableOpacity
    style={[styles.button, secondary && { backgroundColor: theme.bgAlt, borderWidth: 1, borderColor: theme.border }, disabled && { opacity: 0.5 }]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.buttonText, secondary && { color: theme.text }]}>{title}</Text>
  </TouchableOpacity>
);

export const Input: React.FC<{
  value: string; onChangeText: (t: string) => void; placeholder?: string; secureTextEntry?: boolean; multiline?: boolean;
}> = ({ value, onChangeText, placeholder, secureTextEntry, multiline }) => (
  <TextInput
    style={[styles.input, multiline && { height: 120, textAlignVertical: 'top' }]}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={theme.textDim}
    secureTextEntry={secureTextEntry}
    multiline={multiline}
  />
);

export const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <View style={styles.center}>
    <ActivityIndicator color={theme.accent} size="large" />
    {label ? <Text style={[styles.subtitle, { marginTop: 12 }]}>{label}</Text> : null}
  </View>
);

export const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.center}>
    <Text style={styles.subtitle}>{text}</Text>
  </View>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ color: theme.textDim, fontSize: 13, fontWeight: '700', marginHorizontal: 16, marginTop: 18, marginBottom: 4, textTransform: 'uppercase' } as any}>
    {children}
  </Text>
);

export const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 44 }) => {
  const letter = (name || '?').slice(0, 1).toUpperCase();
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>{letter}</Text>
    </View>
  );
};

export const Row: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[stylesheet.row, style]}>{children}</View>
);

const stylesheet = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return '';
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString();
}

/**
 * 下拉刷新辅助钩子：返回一个稳定的 onRefresh（用 ref 缓存最新 load，避免闭包陈旧），
 * 以及 refreshing 状态，直接挂到 FlatList / ScrollView 的 refreshControl 即可。
 */
export function useRefresh(load: () => void | Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const ref = useRef(load);
  ref.current = load;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await ref.current(); } finally { setRefreshing(false); }
  }, []);
  return { refreshing, onRefresh };
}
