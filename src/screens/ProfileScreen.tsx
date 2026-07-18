import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Avatar, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { genderLabel, genderEmoji } from '../shared/types';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();
  const { user, refresh } = useAuth();
  // Viewing self, or another user via route param
  const targetId = route.params?.id ?? user?.id;
  const isSelf = !route.params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!targetId) return;
    setLoading(true);
    api.users.getById(targetId).then(setProfile).catch(() => toast.error('资料加载失败')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [targetId]);

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载资料…" />;
  if (!profile) return <EmptyState text="用户不存在" />;

  const save = async () => {
    if (!user) return;
    try {
      await api.users.update(profile.id, { bio }, user.id);
      setEditing(false); await load(); if (isSelf) refresh();
      toast.success('已保存');
    } catch { toast.error('保存失败'); }
  };

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <View style={{ alignItems: 'center', padding: 24 }}>
        <Avatar name={profile.username} size={80} />
        <Text style={[styles.title, { marginTop: 12 }]}>{profile.username}</Text>
        {profile.gender && <Text style={styles.subtitle}>{genderEmoji(profile.gender)} {genderLabel(profile.gender)}</Text>}
        {profile.birthday && <Text style={styles.subtitle}>🎂 {profile.birthday}</Text>}
      </View>

      <Card>
        {editing ? (
          <>
            <Text style={styles.subtitle}>个人简介</Text>
            <Input value={bio} onChangeText={setBio} placeholder="介绍一下自己…" multiline />
            <View style={{ height: 12 }} />
            <Button title="保存" onPress={save} />
            <View style={{ height: 8 }} />
            <Button title="取消" onPress={() => setEditing(false)} secondary />
          </>
        ) : (
          <>
            <Text style={{ color: theme.text, lineHeight: 22 }}>{profile.bio || '这个人很神秘，什么都没写。'}</Text>
            {isSelf && (
              <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { setBio(profile.bio || ''); setEditing(true); }}>
                <Text style={{ color: theme.accent, fontWeight: '700' }}>编辑资料</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </Card>

      <TouchableOpacity style={styles.card} onPress={() => nav.navigate('Settings')}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="settings-outline" size={20} color={theme.textDim} />
          <Text style={{ color: theme.text, marginLeft: 10 }}>设置</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
