import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, SectionTitle, EmptyState } from '../components/ui';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function GameScreen() {
  const { user } = useAuth();
  const [daily, setDaily] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.game.leaderboard('brainking', 'daily'), api.game.leaderboard('brainking', 'all')])
      .then(([d, a]) => { setDaily(d.scores); setAll(a.scores); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async () => {
    if (!user || score <= 0) return;
    setBusy(true);
    try {
      await api.game.submitScore({ game: 'brainking', userId: user.id, username: user.username, score, timeMs: 0 });
      setScore(0); load();
    } finally { setBusy(false); }
  };

  if (loading) return <Spinner label="加载排行…" />;

  return (
    <ScrollView style={styles.screen}>
      <Card>
        <Text style={[styles.title, { textAlign: 'center' }]}>每日脑力王</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>提交你今天的最高分</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <View style={[styles.input, { flex: 1 }]}>
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{score}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Button title="-10" onPress={() => setScore((s) => Math.max(0, s - 10))} secondary />
          <Button title="+10" onPress={() => setScore((s) => s + 10)} secondary />
          <Button title="提交" onPress={submit} disabled={score <= 0 || busy} />
        </View>
      </Card>
      <SectionTitle>每日排行</SectionTitle>
      {daily.map((l, i) => <Card key={l.user_id}><Text style={{ color: theme.text }}>{i + 1}. {l.username} — {l.score}</Text></Card>)}
      <SectionTitle>总排行</SectionTitle>
      {all.map((l, i) => <Card key={l.user_id}><Text style={{ color: theme.text }}>{i + 1}. {l.username} — {l.score}</Text></Card>)}
    </ScrollView>
  );
}
