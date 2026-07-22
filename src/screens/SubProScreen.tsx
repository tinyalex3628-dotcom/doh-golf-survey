import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Card, IconTile, Press } from '../components/ui';
import { colors, weight } from '../theme/tokens';
import { useToast } from '../components/Toast';

export default function SubProScreen() {
  const { showToast } = useToast();
  return (
    <Screen>
      <View style={styles.head}>
        <LinearGradient colors={[colors.highlightGreen, colors.darkestGreen]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarText}>PRO</Text>
        </LinearGradient>
        <Text style={styles.name}>이도형 프로</Text>
        <Text style={styles.desc}>프로필 소개 문구가 여기 들어가요.{'\n'}경력 · 지도 철학 등 (직접 입력)</Text>
      </View>

      <Press onPress={() => showToast('유튜브 링크 연결 예정')} activeScale={0.99} style={{ marginTop: 18 }}>
        <Card style={styles.ytRow}>
          <IconTile emoji="▶" size={42} bg="rgba(220,50,50,.1)" fontSize={19} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ytTitle}>유튜브 채널 바로가기</Text>
            <Text style={styles.ytSub}>youtube.com/@doh-golf (링크 입력)</Text>
          </View>
          <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
        </Card>
      </Press>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', paddingTop: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.goldLight, fontSize: 11, fontWeight: weight.black },
  name: { fontSize: 21, fontWeight: weight.black, color: colors.ink, marginTop: 14, letterSpacing: -0.4 },
  desc: { fontSize: 12.5, color: colors.textSecondary, marginTop: 4, lineHeight: 19, textAlign: 'center' },
  ytRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16 },
  ytTitle: { fontSize: 14, fontWeight: weight.black, color: colors.ink },
  ytSub: { fontSize: 11, color: colors.textWeak, marginTop: 1 },
});
