import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Avatar, Button, Input, timeAgo, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const toast = useToast();
  const { user } = useAuth();
  const id = route.params?.id;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = await api.posts.getById(id);
      setPost(p);
      setComments(await api.posts.getComments(id));
      if (user) setLiked((await api.posts.checkLike(id, user.id)).liked);
    } catch { toast.error('贴文加载失败'); } finally { setLoading(false); }
  }, [id, user, toast]);

  useEffect(() => { load(); }, [load]);

  const { refreshing, onRefresh } = useRefresh(load);

  const toggleLike = async () => {
    if (!user) return;
    try {
      const r = await api.posts.toggleLike(id, user.id);
      setLiked(r.liked);
      setPost((p: any) => ({ ...p, likes_count: p.likes_count + (r.liked ? 1 : -1) }));
    } catch { toast.error('操作失败'); }
  };

  const send = async () => {
    if (!user || !text.trim()) return;
    try {
      await api.posts.addComment(id, { authorId: user.id, authorName: user.username, content: text.trim(), actorId: user.id });
      setText('');
      await load();
    } catch { toast.error('评论失败'); }
  };

  const del = async () => {
    if (!user) return;
    try {
      await api.posts.delete(id, user.id);
      nav.goBack();
    } catch { toast.error('删除失败'); }
  };

  if (loading) return <Spinner label="加载中…" />;
  if (!post) return <EmptyState text="贴文不存在" />;

  const canDelete = user && (user.id === post.author_id || user.role === 'admin' || user.isSuperAdmin);

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Avatar name={post.author_name} size={36} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>{post.author_name}</Text>
            <Text style={styles.subtitle}>{timeAgo(post.created_at)}</Text>
          </View>
        </View>
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>{post.title}</Text>
        <Text style={{ color: theme.text, lineHeight: 22 }}>{post.content}</Text>
        <View style={{ flexDirection: 'row', marginTop: 14, alignItems: 'center' }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }} onPress={toggleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? theme.danger : theme.textDim} />
            <Text style={[styles.subtitle, { marginLeft: 6 }]}>{post.likes_count}</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>💬 {post.comments_count}</Text>
          {canDelete && (
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={del}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
          )}
        </View>
      </Card>

      <Text style={[styles.subtitle, { marginHorizontal: 16, marginTop: 12 }]}>评论 ({comments.length})</Text>
      {comments.map((c) => (
        <Card key={c.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Avatar name={c.author_name} size={28} />
            <Text style={{ color: theme.text, fontWeight: '700', marginLeft: 8 }}>{c.author_name}</Text>
            <Text style={[styles.subtitle, { marginLeft: 'auto' }]}>{timeAgo(c.created_at)}</Text>
          </View>
          <Text style={{ color: theme.text }}>{c.content}</Text>
        </Card>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <Input value={text} onChangeText={setText} placeholder="写下评论…" />
        <View style={{ width: 10 }} />
        <Button title="发送" onPress={send} disabled={!text.trim()} secondary />
      </View>
    </ScrollView>
  );
}
