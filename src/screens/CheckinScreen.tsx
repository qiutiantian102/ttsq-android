import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, SectionTitle, EmptyState } from '../components/ui';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function CheckinScreen() {
  const { user } = useAuth();
  const [info, setInfo] = useState<any>(null);
  const [streakLeaders, setStreakLeaders] = useState<any[]>([]);
  const [totalLeaders, setTotalLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.checkin.mine(user.id),
      api.checkin.leaderboard('streak'),
      api.checkin.leaderboard('total'),
    ]).then(([a, b, c]) => { setInfo(a); setStreakLeaders(b.scores); setTotalLeaders(c.scores); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const checkIn = async () => {
    if (!user) return;
    setBusy(true);
    try { await api.checkin.checkIn({ userId: user.id, username: user.username }); load(); } finally { setBusy(false); }
  };

  if (!user) return <EmptyState text="请先登录" />;
  if (loading) return <Spinner label="加载打卡…" />;

  return (
    <ScrollView style={styles.screen}>
      <Card>
        <Text style={[styles.title, { textAlign: 'center' }]}>连续打卡 {info.streak} 天</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>累计 {info.total} 天</Text>
        <Button title={info.checkedToday ? '今日已打卡 ✓' : '今日打卡'} onPress={checkIn} disabled={info.checkedToday || busy} />
      </Card>
      <SectionTitle>连续打卡榜</SectionTitle>
      {streakLeaders.map((l, i) => (
        <Card key={l.user_id}><Text style={{ color: theme.text }}>{i + 1}. {l.username} — {l.value} 天</Text></Card>
      ))}
      <SectionTitle>累计打卡榜</SectionTitle>
      {totalLeaders.map((l, i) => (
        <Card key={l.user_id}><Text style={{ color: theme.text }}>{i + 1}. {l.username} — {l.value} 天</Text></Card>
      ))}
    </ScrollView>
  );
}
