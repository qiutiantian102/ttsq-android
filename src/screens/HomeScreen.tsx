import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { SectionTitle, Spinner, Avatar } from '../components/ui';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { Ionicons } from '@expo/vector-icons';

const BOARDS = [
  { key: 'posts', label: '贴文', icon: 'newspaper-outline' as const },
  { key: 'chat', label: '聊天', icon: 'chatbubbles-outline' as const },
  { key: 'creatures', label: '生物', icon: 'paw-outline' as const },
  { key: 'music', label: '音乐', icon: 'musical-notes-outline' as const },
  { key: 'checkin', label: '打卡', icon: 'calendar-outline' as const },
  { key: 'mood', label: '心情', icon: 'happy-outline' as const },
  { key: 'poll', label: '投票', icon: 'stats-chart-outline' as const },
  { key: 'activity', label: '活动', icon: 'flag-outline' as const },
  { key: 'qa', label: '问答', icon: 'help-circle-outline' as const },
  { key: 'gallery', label: '相册', icon: 'images-outline' as const },
  { key: 'birthdays', label: '生日墙', icon: 'gift-outline' as const },
  { key: 'links', label: '链接', icon: 'link-outline' as const },
  { key: 'notes', label: '笔记', icon: 'book-outline' as const },
  { key: 'game', label: '脑力王', icon: 'game-controller-outline' as const },
  { key: 'about', label: '关于', icon: 'information-circle-outline' as const },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.announcements.list().then(setAnnouncements).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.screen}>
      <View style={{ padding: 16, paddingTop: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.title}>你好，{user?.username}</Text>
            <Text style={styles.subtitle}>{new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('Profile')}>
            <Avatar name={user?.username || '?'} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <Spinner label="加载公告…" /> : announcements.length > 0 ? (
        <View style={styles.card}>
          {announcements.slice(0, 3).map((a) => (
            <View key={a.id} style={{ marginBottom: 8 }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{a.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{a.content}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <SectionTitle>社区板块</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
        {BOARDS.map((b) => (
          <TouchableOpacity
            key={b.key}
            style={{
              width: '33.33%', padding: 8, alignItems: 'center',
            }}
            onPress={() => nav.navigate(b.key.charAt(0).toUpperCase() + b.key.slice(1))}
          >
            <View style={{
              width: 64, height: 64, borderRadius: 18, backgroundColor: theme.card,
              alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border,
            }}>
              <Ionicons name={b.icon} size={28} color={theme.accent} />
            </View>
            <Text style={{ color: theme.text, marginTop: 8, fontSize: 13 }}>{b.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
