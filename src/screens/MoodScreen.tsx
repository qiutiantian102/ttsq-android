import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner, Input, Button, EmptyState } from '../components/ui';
import { theme, styles } from '../theme';
import { api } from '../shared/ttsq-api';
import { MOOD_EMOJIS } from '../shared/types';

export default function MoodScreen() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emoji, setEmoji] = useState<string>(MOOD_EMOJIS[0].emoji);
  const [text, setText] = useState('');

  const load = () => { setLoading(true); api.mood.list().then(setList).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const add = async () => {
    if (!user) return;
    await api.mood.create({ emoji, text: text.trim(), userId: user.id, username: user.username, actorId: user.id });
    setText(''); load();
  };

  if (loading) return <Spinner label="加载心情…" />;

  return (
    <ScrollView style={styles.screen}>
      <Card>
        <Text style={styles.subtitle}>今天心情如何？</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {MOOD_EMOJIS.map((m) => (
            <TouchableOpacity key={m.emoji} onPress={() => setEmoji(m.emoji)}
              style={{ padding: 8, borderRadius: 10, backgroundColor: emoji === m.emoji ? theme.accent : theme.bgAlt, margin: 4 }}>
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input value={text} onChangeText={setText} placeholder="说点什么…" multiline />
        <Button title="发布心情" onPress={add} />
      </Card>
      {list.length === 0 ? <EmptyState text="还没有心情动态" /> : list.map((m) => (
        <Card key={m.id}>
          <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
          <Text style={{ color: theme.text, marginTop: 4 }}>{m.text}</Text>
          <Text style={styles.subtitle}>{m.username}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
