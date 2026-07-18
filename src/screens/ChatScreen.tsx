import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Avatar, Input, Button, timeAgo, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'public' | 'private' | 'groups';

// —— 记忆化行组件：输入公聊消息时父组件会重渲染，memo 可避免整列气泡无谓重绘 ——
const PublicBubble = React.memo(({ item, mine }: { item: any; mine: boolean }) => (
  <View style={{ marginBottom: 10, alignItems: mine ? 'flex-end' : 'flex-start' }}>
    <View style={{ maxWidth: '80%', backgroundColor: mine ? theme.accent : theme.card, borderRadius: 14, padding: 10 }}>
      {!mine && <Text style={{ color: theme.accent, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>{item.username}</Text>}
      <Text style={{ color: '#fff' }}>{item.content}</Text>
    </View>
  </View>
));

const ConversationRow = React.memo(({ item, onOpen }: { item: any; onOpen: (id: string, name: string) => void }) => (
  <Card onPress={() => onOpen(item.partner_id, item.partner_name)}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar name={item.partner_name} size={40} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>{item.partner_name}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.last_message}</Text>
      </View>
      <Text style={styles.subtitle}>{timeAgo(item.last_time)}</Text>
    </View>
  </Card>
));

const GroupRow = React.memo(({ item, onOpen }: { item: any; onOpen: (id: string, name: string) => void }) => (
  <Card onPress={() => onOpen(item.id, item.name)}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="people-outline" size={36} color={theme.accent} />
      <View style={{ marginLeft: 12 }}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.description || '暂无简介'}</Text>
      </View>
    </View>
  </Card>
));

export default function ChatScreen() {
  const nav = useNavigation<any>();
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('public');
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPublic = async () => {
    setLoading(true);
    try { setMessages(await api.chat.getMessages(100)); } catch { toast.error('公聊加载失败'); } finally { setLoading(false); }
  };
  const loadPrivate = async () => {
    if (!user) return;
    setLoading(true);
    try { setConversations(await api.messages.getConversations(user.id)); } catch { toast.error('私信加载失败'); } finally { setLoading(false); }
  };
  const loadGroups = async () => {
    setLoading(true);
    try { setGroups(await api.groups.list(user?.id)); } catch { toast.error('群组加载失败'); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'public') loadPublic();
    else if (tab === 'private') loadPrivate();
    else loadGroups();
  }, [tab, user]);

  const sendPublic = async () => {
    if (!user || !text.trim()) return;
    try {
      await api.chat.sendMessage(user.id, user.username, text.trim(), user.id);
      setText('');
      await loadPublic();
    } catch { toast.error('发送失败'); }
  };
  const createGroup = async () => {
    if (!user) return;
    try {
      const g = await api.groups.create({ name: '新群组', creatorId: user.id, creatorName: user.username });
      nav.navigate('GroupChat', { groupId: g.id, name: g.name });
    } catch { toast.error('创建群组失败'); }
  };

  const activeLoad = tab === 'public' ? loadPublic : tab === 'private' ? loadPrivate : loadGroups;
  const { refreshing, onRefresh } = useRefresh(activeLoad);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />
  );

  const TabBtn = ({ t, label }: { t: Tab; label: string }) => (
    <TouchableOpacity
      style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: tab === t ? theme.accent : 'transparent' }}
      onPress={() => setTab(t)}
    >
      <Text style={{ color: tab === t ? theme.accent : theme.textDim, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <TabBtn t="public" label="公聊" />
        <TabBtn t="private" label="私信" />
        <TabBtn t="groups" label="群组" />
      </View>

      {tab === 'public' && (
        <>
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 12 }}
            refreshControl={refreshControl}
            removeClippedSubviews
            renderItem={({ item }) => <PublicBubble item={item} mine={item.user_id === user?.id} />}
          />
          <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
            <Input value={text} onChangeText={setText} placeholder="说点什么…" />
            <View style={{ width: 10 }} />
            <Button title="发送" onPress={sendPublic} disabled={!text.trim()} secondary />
          </View>
        </>
      )}

      {tab === 'private' && (
        loading ? <Spinner /> :
        conversations.length === 0 ? <EmptyState text="还没有私信，去搜索用户发起聊天" /> :
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.partner_id}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={refreshControl}
          removeClippedSubviews
          ListEmptyComponent={<EmptyState text="还没有私信" />}
          renderItem={({ item }) => <ConversationRow item={item} onOpen={(id, name) => nav.navigate('PrivateChat', { partnerId: id, partnerName: name })} />}
        />
      )}

      {tab === 'groups' && (
        loading ? <Spinner /> :
        <FlatList
          data={groups}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={refreshControl}
          removeClippedSubviews
          ListHeaderComponent={
            <TouchableOpacity style={{ padding: 16 }} onPress={createGroup}>
              <Text style={{ color: theme.accent, fontWeight: '700' }}>+ 创建群组</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => <GroupRow item={item} onOpen={(id, name) => nav.navigate('GroupChat', { groupId: id, name })} />}
        />
      )}
    </View>
  );
}
