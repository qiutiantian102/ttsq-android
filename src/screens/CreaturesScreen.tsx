import React, { useEffect, useState } from 'react';
import { ScrollView, Text, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function CreaturesScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const load = () => {
    setLoading(true);
    api.creatures.list().then(setList).catch(() => toast.error('生物加载失败')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!user || !name.trim()) return;
    try {
      await api.creatures.create({ name: name.trim(), category: category.trim() || '未分类', description: description.trim() }, user.id);
      setName(''); setCategory(''); setDescription(''); load();
    } catch { toast.error('添加失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载生物…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>新增生物</Text>
        <Input value={name} onChangeText={setName} placeholder="名称" />
        <Input value={category} onChangeText={setCategory} placeholder="类别" />
        <Input value={description} onChangeText={setDescription} placeholder="描述 (支持 Markdown)" multiline />
        <Button title="添加" onPress={add} disabled={!name.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有生物" /> : list.map((c) => (
        <Card key={c.id}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{c.name}</Text>
          <Text style={styles.subtitle}>{c.category}</Text>
          <Text style={{ color: theme.text, marginTop: 4 }} numberOfLines={3}>{c.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
