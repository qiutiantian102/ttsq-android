import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Card, Button, Input } from '../components/ui';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function NewPostScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!user) return;
    if (!title.trim() || !content.trim()) { setError('标题和内容都不能为空'); return; }
    setBusy(true); setError('');
    try {
      await api.posts.create({
        title: title.trim(), content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        authorId: user.id, authorName: user.username, actorId: user.id,
      });
      nav.navigate('Posts');
    } catch (e: any) {
      setError(e?.message || '发布失败');
    } finally { setBusy(false); }
  };

  return (
    <ScrollView style={styles.screen}>
      <Card>
        <Text style={styles.title}>发布贴文</Text>
        <View style={{ height: 12 }} />
        <Input value={title} onChangeText={setTitle} placeholder="标题" />
        <View style={{ height: 10 }} />
        <Input value={content} onChangeText={setContent} placeholder="内容…" multiline />
        <View style={{ height: 10 }} />
        <Input value={imageUrl} onChangeText={setImageUrl} placeholder="图片链接 (可选)" />
        {error ? <Text style={{ color: theme.danger, marginTop: 8 }}>{error}</Text> : null}
        <View style={{ height: 14 }} />
        <Button title={busy ? '发布中…' : '发布'} onPress={submit} disabled={busy} />
      </Card>
    </ScrollView>
  );
}
