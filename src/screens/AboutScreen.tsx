import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Card } from '../components/ui';
import { theme, styles } from '../theme';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.screen}>
      <Card>
        <Text style={styles.title}>TTSQ</Text>
        <Text style={[styles.subtitle, { marginTop: 8, lineHeight: 22 }]}>
          TTSQ 是一个面向小圈子的社区平台，包含贴文、聊天、音乐分享、每日打卡、问答、相册、脑力游戏等丰富功能。
        </Text>
        <Text style={[styles.subtitle, { marginTop: 12 }]}>版本 1.0.0 · Android / 微信小程序</Text>
      </Card>
    </ScrollView>
  );
}
