import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function GalleryScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const load = () => { setLoading(true); api.gallery.list().then(setList).catch(() => toast.error('相册加载失败')).finally(() => setLoading(false)); };
  useEffect(load, []);

  const add = async () => {
    if (!user || !imageUrl.trim()) return;
    try {
      await api.gallery.create({ imageUrl: imageUrl.trim(), caption: caption.trim(), userId: user.id, username: user.username });
      setImageUrl(''); setCaption(''); load();
    } catch { toast.error('上传失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载相册…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>上传图片</Text>
        <Input value={imageUrl} onChangeText={setImageUrl} placeholder="图片链接 URL" />
        <Input value={caption} onChangeText={setCaption} placeholder="说明 (可选)" />
        <Button title="上传" onPress={add} disabled={!imageUrl.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="相册还是空的" /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
          {list.map((p) => (
            <View key={p.id} style={{ width: '50%', padding: 4 }}>
              <Card>
                <Text style={{ color: theme.text, fontSize: 12 }} numberOfLines={1}>{p.caption || p.authorName}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{p.imageUrl}</Text>
              </Card>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
