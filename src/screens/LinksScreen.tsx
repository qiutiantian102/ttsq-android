import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Linking, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function LinksScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const load = () => { setLoading(true); api.links.list().then(setList).catch(() => toast.error('链接加载失败')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const add = async () => {
    if (!user || !name.trim() || !url.trim()) return;
    try {
      await api.links.create({ name: name.trim(), url: url.trim(), description: description.trim() || undefined, createdBy: user.id });
      setName(''); setUrl(''); setDescription(''); load();
    } catch { toast.error('添加失败'); }
  };

  const del = async (id: string) => {
    if (!user) return;
    try {
      await api.links.delete(id, user.id);
      load();
    } catch { toast.error('删除失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载链接…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>收藏链接</Text>
        <Input value={name} onChangeText={setName} placeholder="名称" />
        <Input value={url} onChangeText={setUrl} placeholder="URL" />
        <Input value={description} onChangeText={setDescription} placeholder="描述 (可选)" />
        <Button title="添加" onPress={add} disabled={!name.trim() || !url.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有收藏" /> : list.map((l) => (
        <Card key={l.id} onPress={() => Linking.openURL(l.url)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{l.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{l.url}</Text>
            </View>
            <Text style={{ color: theme.danger, marginLeft: 10 }} onPress={() => del(l.id)}>删</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
