import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import PostsScreen from '../screens/PostsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import NewPostScreen from '../screens/NewPostScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

import CreaturesScreen from '../screens/CreaturesScreen';
import MusicScreen from '../screens/MusicScreen';
import CheckinScreen from '../screens/CheckinScreen';
import MoodScreen from '../screens/MoodScreen';
import PollScreen from '../screens/PollScreen';
import ActivityScreen from '../screens/ActivityScreen';
import QAScreen from '../screens/QAScreen';
import GalleryScreen from '../screens/GalleryScreen';
import BirthdaysScreen from '../screens/BirthdaysScreen';
import LinksScreen from '../screens/LinksScreen';
import NotesScreen from '../screens/NotesScreen';
import AdminScreen from '../screens/AdminScreen';
import AboutScreen from '../screens/AboutScreen';
import GameScreen from '../screens/GameScreen';
import PrivateChatScreen from '../screens/PrivateChatScreen';
import GroupChatScreen from '../screens/GroupChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabScreenOptions = ({ route }: any) => ({
  tabBarActiveTintColor: theme.accent,
  tabBarInactiveTintColor: theme.textDim,
  tabBarStyle: { backgroundColor: theme.bgAlt, borderTopColor: theme.border },
  headerStyle: { backgroundColor: theme.bg },
  headerTintColor: theme.text,
  tabBarIcon: ({ color, size }: any) => {
    const map: Record<string, any> = {
      Home: 'home-outline', Posts: 'newspaper-outline', Chat: 'chatbubbles-outline', Profile: 'person-outline',
    };
    return <Ionicons name={map[route.name] || 'ellipse-outline'} size={size} color={color} />;
  },
});

function Tabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Posts" component={PostsScreen} options={{ title: '贴文' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: '聊天' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.bg }, headerTintColor: theme.text, contentStyle: { backgroundColor: theme.bg } }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '贴文详情' }} />
            <Stack.Screen name="NewPost" component={NewPostScreen} options={{ title: '发布贴文' }} />
            <Stack.Screen name="PrivateChat" component={PrivateChatScreen} options={{ title: '私信' }} />
            <Stack.Screen name="GroupChat" component={GroupChatScreen} options={{ title: '群组' }} />
            <Stack.Screen name="Creatures" component={CreaturesScreen} options={{ title: '生物图鉴' }} />
            <Stack.Screen name="Music" component={MusicScreen} options={{ title: '音乐分享' }} />
            <Stack.Screen name="Checkin" component={CheckinScreen} options={{ title: '每日打卡' }} />
            <Stack.Screen name="Mood" component={MoodScreen} options={{ title: '心情签到' }} />
            <Stack.Screen name="Poll" component={PollScreen} options={{ title: '投票' }} />
            <Stack.Screen name="Activity" component={ActivityScreen} options={{ title: '活动' }} />
            <Stack.Screen name="QA" component={QAScreen} options={{ title: '问答' }} />
            <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: '社区相册' }} />
            <Stack.Screen name="Birthdays" component={BirthdaysScreen} options={{ title: '生日墙' }} />
            <Stack.Screen name="Links" component={LinksScreen} options={{ title: '链接收藏' }} />
            <Stack.Screen name="Notes" component={NotesScreen} options={{ title: '笔记' }} />
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: '管理后台' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: '关于' }} />
            <Stack.Screen name="Game" component={GameScreen} options={{ title: '每日脑力王' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
