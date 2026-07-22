import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, IconTile, Pill, Press, ProgressBar, SectionLabel } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';

export default function HomeScreen() {
  const { go } = useNav();

  const shortcuts: {
    route: RouteName;
    emoji: string;
    title: string;
    desc: string;
    dark?: boolean;
    goldBorder?: boolean;
  }[] = [
    { route: 'hub1', emoji: '🎬', title: '스윙 분석', desc: 'AI 분석 · 업로드 · 갤러리', dark: true },
    { route: 'hub2', emoji: '⚔', title: '프로와 비교', desc: '프로 스윙과 나란히', goldBorder: true },
    { route: 'feedback', emoji: '💬', title: '프로에게 문의', desc: '궁금할 때 언제든' },
    { route: 'subscription', emoji: '📖', title: '구독 안내', desc: '혜택 · 오프라인 · 프로' },
  ];

  return (
    <Screen>
      {/* 인사 */}
      <View style={{ paddingHorizontal: 2, paddingTop: 6 }}>
        <Text style={styles.greeting}>안녕하세요,{'\n'}오늘도 한 걸음 나아가요</Text>
        <Text style={styles.greetingSub}>7월 22일 · 연속 6일째</Text>
      </View>

      {/* 이번 주 목표 숙제 카드 */}
      <Press onPress={() => go('homework')} activeScale={0.99} style={{ marginTop: 16 }}>
        <Card style={{ borderRadius: radius.cardLg, padding: 20 }}>
          <View style={styles.rowBetween}>
            <SectionLabel style={{ color: colors.gold, letterSpacing: 1 }}>이번 주 목표 숙제</SectionLabel>
            <Pill>2개 남음</Pill>
          </View>
          <Text style={styles.homeworkTitle}>
            임팩트에서 골반 먼저 리드하기{'\n'}+ 백스윙 탑 위치 고정
          </Text>
          <View style={{ marginTop: 12 }}>
            <ProgressBar value={40} />
          </View>
          <View style={[styles.rowBetween, { marginTop: 9 }]}>
            <Text style={styles.metaText}>이도형 프로 · 마감 7/27</Text>
            <Text style={styles.ctaInline}>확인하기 ›</Text>
          </View>
        </Card>
      </Press>

      {/* 바로가기 2x2 */}
      <SectionLabel style={{ marginTop: 20, marginBottom: 10 }}>바로가기</SectionLabel>
      <View style={styles.grid}>
        {shortcuts.map((s) => (
          <Press key={s.route} onPress={() => go(s.route)} style={styles.gridCell}>
            {s.dark ? (
              <DarkCard style={styles.shortcut}>
                <ShortcutBody {...s} />
              </DarkCard>
            ) : (
              <View
                style={[
                  styles.shortcut,
                  styles.shortcutLight,
                  s.goldBorder && { borderColor: colors.gold, borderWidth: 1.5 },
                ]}
              >
                <ShortcutBody {...s} />
              </View>
            )}
          </Press>
        ))}
      </View>
    </Screen>
  );
}

function ShortcutBody({
  emoji,
  title,
  desc,
  dark,
}: {
  emoji: string;
  title: string;
  desc: string;
  dark?: boolean;
}) {
  return (
    <>
      <IconTile emoji={emoji} bg={dark ? 'rgba(237,217,163,.16)' : 'rgba(46,92,68,.1)'} />
      <View style={{ marginTop: 'auto' }}>
        <Text style={[styles.shortcutTitle, { color: dark ? colors.onDark : colors.ink }]}>{title}</Text>
        <Text style={[styles.shortcutDesc, { color: dark ? colors.onDarkSecondary : colors.textSecondary }]}>
          {desc}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 23, fontWeight: weight.black, letterSpacing: -0.4, color: colors.ink, lineHeight: 29 },
  greetingSub: { fontSize: 12.5, color: colors.textWeak, marginTop: 5 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeworkTitle: {
    fontSize: 18,
    fontWeight: weight.black,
    marginTop: 8,
    letterSpacing: -0.3,
    color: colors.ink,
    lineHeight: 24,
  },
  metaText: { fontSize: 11, color: colors.textWeak },
  ctaInline: { fontSize: 12.5, fontWeight: weight.black, color: colors.accentGreen },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCell: { width: '48%' },
  shortcut: { borderRadius: 18, padding: 16, aspectRatio: 1 / 0.92 },
  shortcutLight: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutTitle: { fontSize: 16, fontWeight: weight.black },
  shortcutDesc: { fontSize: 10.5, marginTop: 3, lineHeight: 14 },
});
