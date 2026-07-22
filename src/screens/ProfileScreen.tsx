import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Card, DarkCard, IconTile, Press } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';

const MENU: { emoji: string; iconBg: string; title: string; sub: string; route: RouteName }[] = [
  { emoji: '📝', iconBg: 'rgba(46,92,68,.1)', title: '이번 주 목표 숙제', sub: '2개 남음 · 마감 7/27', route: 'homework' },
  { emoji: '📖', iconBg: 'rgba(176,122,46,.14)', title: '구독별 안내사항', sub: '혜택 · 오프라인 · 프로 · 피드백', route: 'subscription' },
  { emoji: '📚', iconBg: 'rgba(46,92,68,.1)', title: '골프 사전', sub: '용어 검색 · 영상 · 설명', route: 'dict' },
];

export default function ProfileScreen() {
  const { go } = useNav();
  return (
    <Screen>
      {/* 유저 헤더 */}
      <View style={styles.head}>
        <LinearGradient colors={[colors.highlightGreen, colors.darkestGreen]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarText}>나</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>골프러버</Text>
          <Text style={styles.sub}>연속 6일째 · 등록 스윙 12개</Text>
        </View>
      </View>

      {/* MY PLAN */}
      <DarkCard style={styles.planRow}>
        <View>
          <Text style={styles.planLabel}>MY PLAN</Text>
          <Text style={styles.planName}>Coaching · 월 2회 피드백</Text>
        </View>
        <Press onPress={() => go('membership')} activeScale={0.9} style={styles.planBtn}>
          <Text style={styles.planBtnText}>관리</Text>
        </Press>
      </DarkCard>

      {/* 메뉴 */}
      <View style={{ gap: 9, marginTop: 14 }}>
        {MENU.map((m) => (
          <Press key={m.route} onPress={() => go(m.route)} activeScale={0.99}>
            <Card style={styles.menuRow}>
              <IconTile emoji={m.emoji} size={38} bg={m.iconBg} fontSize={17} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{m.title}</Text>
                <Text style={styles.menuSub}>{m.sub}</Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
            </Card>
          </Press>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 2, paddingTop: 6 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.goldLight, fontSize: 20, fontWeight: weight.black },
  name: { fontSize: 19, fontWeight: weight.black, color: colors.ink, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: colors.textWeak, marginTop: 2 },
  planRow: { marginTop: 14, padding: 15, borderRadius: radius.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planLabel: { fontSize: 10, fontWeight: weight.black, letterSpacing: 0.8, color: colors.goldLight },
  planName: { fontSize: 16, fontWeight: weight.black, color: colors.onDark, marginTop: 3 },
  planBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: 'rgba(237,217,163,.16)' },
  planBtnText: { fontSize: 11.5, fontWeight: weight.black, color: colors.goldLight },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: radius.chip },
  menuTitle: { fontSize: 14, fontWeight: weight.black, color: colors.ink },
  menuSub: { fontSize: 11, color: colors.textWeak, marginTop: 1 },
});
