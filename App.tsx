import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/Toast';
import { theme } from './src/theme';

// 当 App 从后台回到前台时，刷新当前用户资料，保证头像/状态/权限保持新鲜。
function AppStateRefresh() {
  const { refresh } = useAuth();
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);
  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <AppStateRefresh />
          <AppNavigator />
          <StatusBar style="light" backgroundColor={theme.bg} />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
