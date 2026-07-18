import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Input, Button, Spinner, Avatar, timeAgo, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

const Bubble = React.memo(({ item, mine }: { item: any; mine: boolean }) => (
  <View style={{ marginBottom: 10, alignItems: mine ? 'flex-end' : 'flex-start' }}>
    <View style={{ maxWidth: '80%', backgroundColor: mine ? theme.accent : theme.card, borderRadius: 14, padding: 10 }}>
      <Text style={{ color: '#fff' }}>{item.content}</Text>
    </View>
  </View>
));

export default function PrivateChatScreen() {
  const route = useRoute<any>();
  const toast = useToast();
  const { user } = useAuth();
  const { partnerId, partnerName } = route.params || {};
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setMsgs(await api.messages.getPrivate(user.id, partnerId)); } catch { toast.error('消息加载失败'); } finally { setLoading(false); }
  }, [user, partnerId, toast]);

  useEffect(() => { load(); }, [load]);

  const send = useCallback(async () => {
    if (!user || !text.trim()) return;
    try {
      await api.messages.sendPrivate({ senderId: user.id, senderName: user.username, receiverId: partnerId, receiverName: partnerName, content: text.trim(), actorId: user.id });
      setText(''); await load();
    } catch { toast.error('发送失败'); }
  }, [user, text, partnerId, partnerName, load]);

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载中…" />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <Bubble item={item} mine={item.sender_id === user?.id} />}
        ListEmptyComponent={<EmptyState text="开始聊天吧" />}
      />
      <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
        <Input value={text} onChangeText={setText} placeholder="输入消息…" />
        <View style={{ width: 10 }} />
        <Button title="发送" onPress={send} disabled={!text.trim()} secondary />
      </View>
    </View>
  );
}
