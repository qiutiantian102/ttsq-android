import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Spinner, Avatar, timeAgo, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { Ionicons } from '@expo/vector-icons';

export default function PostsScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setPosts(await api.posts.list());
    } catch {
      toast.error('贴文加载失败');
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [fetchPosts]);

  const { refreshing, onRefresh } = useRefresh(fetchPosts);

  if (loading) return <Spinner label="加载贴文…" />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
        ListEmptyComponent={<EmptyState text="还没有贴文，去发一条吧" />}
        renderItem={({ item }) => (
          <Card onPress={() => nav.navigate('PostDetail', { id: item.id })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Avatar name={item.author_name} size={36} />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: theme.text, fontWeight: '700' }}>{item.author_name}</Text>
                <Text style={styles.subtitle}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{item.content}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Text style={styles.subtitle}>❤️ {item.likes_count}　💬 {item.comments_count}</Text>
            </View>
          </Card>
        )}
      />
      <TouchableOpacity
        style={{ position: 'absolute', right: 20, bottom: 24, backgroundColor: theme.accent, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => nav.navigate('NewPost')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
