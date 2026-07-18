// 启动后自动检测新版本：若后端返回的最新版本高于当前安装版本，
// 且用户未忽略该版本，则弹出更新提示。忽略记录持久化在 AsyncStorage。
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Linking } from 'react-native';
import { checkForUpdate, getDismissedVersion, dismissVersion, UpdateInfo } from '../shared/versionCheck';
import { theme, styles } from '../theme';

export default function VersionCheck() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await checkForUpdate();
        if (!active || !res.updateAvailable || !res.info) return;
        const dismissed = await getDismissedVersion();
        if (dismissed === res.latest) return;
        setInfo(res.info);
        setVisible(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openDownload = () => {
    if (info?.downloadUrl) Linking.openURL(info.downloadUrl);
  };

  const later = () => {
    if (info) dismissVersion(info.version);
    setVisible(false);
  };

  if (!visible || !info) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={[styles.card, { width: '100%', maxWidth: 360, margin: 0 }]}>
          <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 18, marginBottom: 4 }}>
            发现新版本 v{info.version}
          </Text>
          <Text style={styles.subtitle}>建议更新以获得更好的体验与最新功能。</Text>
          {info.notes ? (
            <Text style={[styles.subtitle, { marginTop: 8 }]} numberOfLines={6}>
              {info.notes}
            </Text>
          ) : null}
          <View style={{ marginTop: 16, flexDirection: 'row' }}>
            <TouchableOpacity
              style={[styles.button, { flex: 1, marginRight: 8, backgroundColor: theme.bgAlt, borderWidth: 1, borderColor: theme.border }]}
              onPress={later}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>稍后</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={openDownload}>
              <Text style={styles.buttonText}>立即更新</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
