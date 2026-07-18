import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function ActivityScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const load = () => { setLoading(true); api.activity.list(user?.id).then(setList).catch(() => toast.error('活动加载失败')).finally(() => setLoading(false)); };
  useEffect(load, [user]);

  const add = async () => {
    if (!user || !title.trim()) return;
    try {
      await api.activity.create({ title: title.trim(), description: description.trim(), creatorId: user.id, creatorName: user.username });
      setTitle(''); setDescription(''); load();
    } catch { toast.error('发起失败'); }
  };

  const checkin = async (a: any) => {
    if (!user) return;
    try {
      await api.activity.checkin(a.id, user.id, user.username);
      load();
    } catch { toast.error('参与失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载活动…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>发起活动</Text>
        <Input value={title} onChangeText={setTitle} placeholder="活动标题" />
        <Input value={description} onChangeText={setDescription} placeholder="简介" multiline />
        <Button title="发起" onPress={add} disabled={!title.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有活动" /> : list.map((a) => (
        <Card key={a.id}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{a.title}</Text>
          <Text style={styles.subtitle}>{a.description}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={styles.subtitle}>已有 {a.checkinCount} 人参与</Text>
            <View style={{ marginLeft: 'auto' }}>
              <Button title={a.checkedIn ? '已参与 ✓' : '参与'} onPress={() => checkin(a)} disabled={a.checkedIn} secondary />
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
