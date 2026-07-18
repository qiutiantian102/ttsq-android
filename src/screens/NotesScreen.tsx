import React, { useEffect, useState } from 'react';
import { ScrollView, Text, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function NotesScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const load = () => {
    if (!user) return;
    setLoading(true);
    api.notes.list(user.id).then(setList).catch(() => toast.error('笔记加载失败')).finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const add = async () => {
    if (!user || !content.trim()) return;
    try {
      await api.notes.create({ authorId: user.id, authorName: user.username, content: content.trim(), visibility: { type: 'public' } });
      setContent(''); load();
    } catch { toast.error('发布失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (!user) return <EmptyState text="请先登录" />;
  if (loading) return <Spinner label="加载笔记…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>写笔记 (公开)</Text>
        <Input value={content} onChangeText={setContent} placeholder="记点什么…" multiline />
        <Button title="发布" onPress={add} disabled={!content.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有笔记" /> : list.map((n) => (
        <Card key={n.id}>
          <Text style={{ color: theme.text }}>{n.content}</Text>
          <Text style={styles.subtitle}>{n.authorName}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
