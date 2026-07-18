import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { Card, Spinner, Avatar, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function BirthdaysScreen() {
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBirthdays = useCallback(async () => {
    try {
      const r = await api.users.birthdays();
      setItems(r.items);
    } catch {
      toast.error('生日墙加载失败');
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    fetchBirthdays().finally(() => setLoading(false));
  }, [fetchBirthdays]);

  const { refreshing, onRefresh } = useRefresh(fetchBirthdays);

  if (loading) return <Spinner label="加载生日墙…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      {items.length === 0 ? <EmptyState text="暂无生日数据" /> : items.map((u) => (
        <Card key={u.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={u.username} size={40} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{u.username}</Text>
              <Text style={styles.subtitle}>{u.birthday}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: u.isToday ? theme.accent : theme.textDim, fontWeight: '700' }}>
                {u.isToday ? '今天生日 🎂' : `${u.daysUntil} 天后`}
              </Text>
              <Text style={styles.subtitle}>{u.month}月{u.day}日</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
