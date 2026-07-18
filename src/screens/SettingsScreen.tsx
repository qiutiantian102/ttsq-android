import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { Card, Button, Spinner } from '../components/ui';
import { theme, styles } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { checkForUpdate, CURRENT_APP_VERSION } from '../shared/versionCheck';

const ITEMS = [
  { key: 'about', label: '关于 TTSQ', icon: 'information-circle-outline' as const },
  { key: 'checkUpdate', label: '检查更新', icon: 'cloud-download-outline' as const },
  { key: 'admin', label: '管理后台', icon: 'shield-outline' as const, adminOnly: true },
];

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const { user, logout } = useAuth();

  if (!user) return <Spinner />;

  const onLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: logout },
    ]);
  };

  const handleCheckUpdate = async () => {
    try {
      const { updateAvailable, info } = await checkForUpdate();
      if (updateAvailable && info) {
        Alert.alert(`发现新版本 v${info.version}`, info.notes || '建议更新以获得更好体验', [
          { text: '稍后', style: 'cancel' },
          { text: '前往下载', onPress: () => { if (info.downloadUrl) Linking.openURL(info.downloadUrl); } },
        ]);
      } else {
        Alert.alert('已是最新', `当前版本 v${CURRENT_APP_VERSION} 已是最新。`);
      }
    } catch {
      Alert.alert('检查失败', '暂时无法连接更新服务器，请稍后再试。');
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <Card>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{user.username}</Text>
        <Text style={styles.subtitle}>{user.role === 'admin' || user.isSuperAdmin ? '管理员' : '普通用户'}</Text>
      </Card>

      {ITEMS.filter((i) => !i.adminOnly || user.role === 'admin' || user.isSuperAdmin).map((i) => (
        <TouchableOpacity
          key={i.key}
          style={styles.card}
          onPress={() => {
            if (i.key === 'checkUpdate') handleCheckUpdate();
            else nav.navigate(i.key.charAt(0).toUpperCase() + i.key.slice(1));
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={i.icon} size={20} color={theme.textDim} />
            <Text style={{ color: theme.text, marginLeft: 10 }}>{i.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textDim} style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ padding: 16 }}>
        <Button title="退出登录" onPress={onLogout} disabled={false} secondary />
      </View>
    </ScrollView>
  );
}
