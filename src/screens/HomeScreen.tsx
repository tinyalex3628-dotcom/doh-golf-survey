import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';
import { BRAND } from '../brand/brand';

export default function HomeScreen() {
  const { go } = useNav();

  const secondary: { label: string; value: string; route: RouteName }[] = [
    { label: '다음 스윙 업로드', value: '목요일 · D-2', route: 'upload' },
    { label: '지난 코치 피드백', value: '다시 보기', route: 'homework' },
  ];

  return (
    <Screen>
      {/* 워드마크 */}
      <Text style={styles.wordmark}>{BRAND.wordmark}</Text>

      {/* 코치의 인사 */}
      <Text style={styles.greeting}>좋은 아침입니다,{'\n'}골프러버 님.</Text>

      {/* 오늘 해야 할 한 가지 */}
      <View style={styles.focus}>
        <Text style={styles.eyebrow}>오늘 해야 할 한 가지</Text>
        <View style={styles.rule} />
        <Text style={styles.oneThing}>임팩트에서{'\n'}골반 먼저 리드하기</Text>

        <Text style={styles.coachNote}>“이번 주엔 골반만 생각합시다.”</Text>
        <Text style={styles.coachSign}>— {BRAND.coachName} 코치</Text>

        <Press onPress={() => go('homework')} activeScale={0.98} style={styles.cta}>
          <Text style={styles.ctaText}>코치 영상 보기</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </Press>
      </View>

      {/* 조용한 보조 정보 */}
      <View style={styles.secondary}>
        {secondary.map((s, i) => (
          <Press key={s.route} onPress={() => go(s.route)} activeScale={0.99}>
            <View style={[styles.secRow, i > 0 && styles.secDivider]}>
              <Text style={styles.secLabel}>{s.label}</Text>
              <Text style={styles.secValue}>{s.value} →</Text>
            </View>
          </Press>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wordmark: { fontSize: 18, fontWeight: weight.heavy, color: colors.ink, letterSpacing: 1, marginTop: 8 },

  greeting: { fontSize: 23, fontWeight: weight.semibold, color: colors.ink, lineHeight: 33, marginTop: 34, letterSpacing: -0.4 },

  // 오늘의 한 가지 (타이포·여백으로 포커스)
  focus: { marginTop: 44 },
  eyebrow: { fontSize: 12, fontWeight: weight.semibold, color: colors.textWeak, letterSpacing: 0.5 },
  rule: { height: 1, backgroundColor: colors.border, marginTop: 14, marginBottom: 18 },
  oneThing: { fontSize: 27, fontWeight: weight.bold, color: colors.ink, lineHeight: 37, letterSpacing: -0.6 },

  coachNote: { fontSize: 15, color: colors.textSecondary, marginTop: 22, lineHeight: 23 },
  coachSign: { fontSize: 12.5, color: colors.textWeak, marginTop: 8 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 26,
    paddingVertical: 16,
    borderRadius: radius.button,
    backgroundColor: colors.ink,
  },
  ctaText: { fontSize: 14.5, fontWeight: weight.semibold, color: colors.onDark, letterSpacing: 0.3 },
  ctaArrow: { fontSize: 15, color: colors.onDark },

  // 보조
  secondary: { marginTop: 48 },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 17 },
  secDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  secLabel: { fontSize: 13.5, color: colors.textSecondary },
  secValue: { fontSize: 13, fontWeight: weight.medium, color: colors.ink },
});
