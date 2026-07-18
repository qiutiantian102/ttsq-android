import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function QAScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = () => { setLoading(true); api.qa.list().then(setList).catch(() => toast.error('问答加载失败')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const add = async () => {
    if (!user || !title.trim()) return;
    try {
      await api.qa.create({ title: title.trim(), content: content.trim(), userId: user.id, username: user.username, actorId: user.id });
      setTitle(''); setContent(''); load();
    } catch { toast.error('发布失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载问答…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>提问</Text>
        <Input value={title} onChangeText={setTitle} placeholder="问题标题" />
        <Input value={content} onChangeText={setContent} placeholder="详细描述 (可选)" multiline />
        <Button title="发布问题" onPress={add} disabled={!title.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有问题" /> : list.map((q) => (
        <Card key={q.id} onPress={() => nav.navigate('QADetail', { id: q.id })}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{q.title}</Text>
          <Text style={styles.subtitle}>{q.authorName} · {q.answerCount || 0} 个回答</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
