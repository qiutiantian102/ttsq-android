import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Avatar, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function AdminScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.users.list(user.id).then(setUsers).catch(() => toast.error('用户加载失败')).finally(() => setLoading(false));
  }, [user, toast]);

  const del = (u: any) => {
    if (!user) return;
    Alert.alert('删除用户', `确定删除 ${u.username}？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        try {
          await api.users.delete(u.id, user.id);
          setUsers((list) => list.filter((x) => x.id !== u.id));
          toast.success('已删除');
        } catch { toast.error('删除失败'); }
      } },
    ]);
  };

  const load = useRefresh(async () => {
    if (!user) return;
    try { setUsers(await api.users.list(user.id)); } catch { toast.error('用户加载失败'); }
  });

  if (!user || (user.role !== 'admin' && !user.isSuperAdmin)) {
    return <EmptyState text="仅管理员可访问" />;
  }
  if (loading) return <Spinner label="加载用户…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={load.refreshing} onRefresh={load.onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      {users.map((u) => (
        <Card key={u.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={u.username} size={40} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{u.username}</Text>
              <Text style={styles.subtitle}>{u.is_super_admin === 1 ? '超级管理员' : u.role === 'admin' ? '管理员' : '用户'}</Text>
            </View>
            {u.is_super_admin !== 1 && (
              <Text style={{ color: theme.danger }} onPress={() => del(u)}>删除</Text>
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
