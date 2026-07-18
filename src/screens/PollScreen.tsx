import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Button, Input, EmptyState, useRefresh } from '../components/ui';
import { useToast } from '../components/Toast';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';

export default function PollScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('选项一\n选项二');

  const load = () => {
    setLoading(true);
    api.poll.list(user?.id).then(setList).catch(() => toast.error('投票加载失败')).finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const add = async () => {
    if (!user || !question.trim()) return;
    const opts = options.split('\n').map((s) => s.trim()).filter(Boolean);
    if (opts.length < 2) return;
    try {
      await api.poll.create({ question: question.trim(), options: opts, createdBy: user.id, username: user.username });
      setQuestion(''); setOptions('选项一\n选项二'); load();
    } catch { toast.error('发起失败'); }
  };

  const vote = async (p: any, idx: number) => {
    if (!user) return;
    try {
      await api.poll.vote(p.id, user.id, idx);
      load();
    } catch { toast.error('投票失败'); }
  };

  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <Spinner label="加载投票…" />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <Card>
        <Text style={styles.subtitle}>发起投票</Text>
        <Input value={question} onChangeText={setQuestion} placeholder="问题" />
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top', marginTop: 10 }]}
          value={options} onChangeText={setOptions} placeholder="每个选项一行" multiline
        />
        <Button title="发起" onPress={add} disabled={!question.trim()} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有投票" /> : list.map((p) => (
        <Card key={p.id}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{p.question}</Text>
          {p.results.map((r: any) => (
            <TouchableOpacity key={r.index} style={styles.card} onPress={() => vote(p, r.index)}
              disabled={p.votedOption !== null}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.text }}>{r.label}</Text>
                <Text style={styles.subtitle}>{r.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={styles.subtitle}>共 {p.totalVotes} 票{p.votedOption !== null ? ' · 已投票' : ''}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
