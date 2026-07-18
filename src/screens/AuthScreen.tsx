import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { theme, styles } from '../theme';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!username.trim() || !password) { setError('请输入用户名和密码'); return; }
    setBusy(true);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password, birthday || null, gender || null);
    } catch (e: any) {
      setError(e?.message || '操作失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={[styles.title, { textAlign: 'center', marginBottom: 6 }]}>TTSQ</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 24 }]}>
          {mode === 'login' ? '登录你的账号' : '创建一个新账号'}
        </Text>

        <Card>
          <Input value={username} onChangeText={setUsername} placeholder="用户名" />
          <View style={{ height: 10 }} />
          <Input value={password} onChangeText={setPassword} placeholder="密码" secureTextEntry />
          {mode === 'register' && (
            <>
              <View style={{ height: 10 }} />
              <Input value={birthday} onChangeText={setBirthday} placeholder="生日 (YYYY-MM-DD，可选)" />
              <View style={{ height: 10 }} />
              <Input value={gender} onChangeText={setGender} placeholder="性别 id (可选，如 female)" />
            </>
          )}
          {error ? <Text style={{ color: theme.danger, marginTop: 10 }}>{error}</Text> : null}
          <View style={{ height: 14 }} />
          <Button title={busy ? '请稍候…' : mode === 'login' ? '登录' : '注册'} onPress={submit} disabled={busy} />
          <View style={{ height: 12 }} />
          <Text
            style={{ color: theme.accent, textAlign: 'center' }}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
