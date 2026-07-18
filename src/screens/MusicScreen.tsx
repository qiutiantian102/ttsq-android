import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Linking, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { MUSIC_PLATFORMS, musicPlatformLabel } from '../shared/types';

export default function MusicScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [artist, setArtist] = useState('');
  const [platform, setPlatform] = useState('netease');

  const load = () => { setLoading(true); api.music.list().then(setList).catch(() => toast.error('音乐加载失败')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const add = async () => {
    if (!user || !title.trim() || !url.trim()) return;
    try {
      await api.music.create({ title: title.trim(), url: url.trim(), artist: artist.trim() || undefined, platform, createdBy: user.id });
      setTitle(''); setUrl(''); setArtist(''); load();
    } catch { toast.error('分享失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载音乐…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>分享音乐</Text>
        <Input value={title} onChangeText={setTitle} placeholder="歌曲名" />
        <Input value={artist} onChangeText={setArtist} placeholder="艺术家 (可选)" />
        <Input value={url} onChangeText={setUrl} placeholder="分享链接" />
        <Input value={platform} onChangeText={setPlatform} placeholder="平台 id (netease/qq/spotify/...)" />
        <Button title="分享" onPress={add} disabled={!title.trim() || !url.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有音乐分享" /> : list.map((m) => (
        <Card key={m.id} onPress={() => Linking.openURL(m.url)}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{m.title}</Text>
          <Text style={styles.subtitle}>{m.artist || '未知'} · {musicPlatformLabel(m.platform)}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
