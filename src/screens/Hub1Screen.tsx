import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, IconTile, Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';

const CARDS: { tag: string; icon: string; iconBg: string; name: string; desc: string; route: RouteName }[] = [
  { tag: 'PAGE ①', icon: '⬆', iconBg: 'rgba(46,92,68,.1)', name: '스윙 업로드', desc: '정면·측면 영상 올리기', route: 'upload' },
  { tag: 'PAGE ②', icon: '🖼', iconBg: 'rgba(46,92,68,.1)', name: '내 스윙 갤러리', desc: '과거 스윙 날짜별 조회', route: 'gallery' },
  { tag: 'PAGE ③', icon: '🎬', iconBg: 'rgba(176,122,46,.14)', name: '단독 분석', desc: '슬라이드바·선·캡처·AI', route: 'single' },
  { tag: 'PAGE ④', icon: '⚖', iconBg: 'rgba(176,122,46,.14)', name: '멀티스크린 비교', desc: '현재↔과거 스윙 비교', route: 'multi' },
];

export default function Hub1Screen() {
  const { go } = useNav();
  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={tt.screenTitle}>스윙 분석</Text>
        <Text style={tt.subtitle}>AI 분석부터 시작하거나, 아래 페이지로 바로 이동할 수 있어요.</Text>
      </View>

      {/* AI 강조 카드 */}
      <Press onPress={() => go('aiSurvey')} activeScale={0.99} style={{ marginTop: 16 }}>
        <DarkCard style={{ padding: 20 }}>
          <SectionLabel style={{ color: colors.goldLight, letterSpacing: 1 }}>AI 스윙분석 · 추천</SectionLabel>
          <Text style={styles.emphTitle}>AI 스윙분석 + 설문</Text>
          <Text style={styles.emphDesc}>
            간단한 설문 → 스윙 등록 → 추가 질문 → 맞춤 분석 결과{'\n'}내 몸과 목표에 맞춘 분석을 받아보세요
          </Text>
          <Text style={styles.emphCta}>시작하기 ›</Text>
        </DarkCard>
      </Press>

      <SectionLabel style={{ marginTop: 18, marginBottom: 9 }}>또는 직접 이동하기</SectionLabel>
      <View style={styles.grid}>
        {CARDS.map((c) => (
          <Press key={c.route} onPress={() => go(c.route)} style={styles.cell}>
            <Card style={styles.pageCard}>
              <IconTile emoji={c.icon} bg={c.iconBg} />
              <View style={{ marginTop: 'auto' }}>
                <Text style={styles.pageTag}>{c.tag}</Text>
                <Text style={styles.pageName}>{c.name}</Text>
                <Text style={styles.pageDesc}>{c.desc}</Text>
              </View>
            </Card>
          </Press>
        ))}
      </View>

      <Press onPress={() => go('hub2')} activeScale={0.99} style={{ marginTop: 12 }}>
        <View style={styles.hub2Banner}>
          <IconTile emoji="⚔" size={36} bg="rgba(237,217,163,.16)" fontSize={17} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hub2Title}>프로와 비교하기 (Hub 2)</Text>
            <Text style={styles.hub2Sub}>여기서도, Home에서도 진입 가능</Text>
          </View>
          <Text style={{ color: colors.goldLight, fontSize: 16 }}>›</Text>
        </View>
      </Press>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emphTitle: { fontSize: 21, fontWeight: weight.black, color: colors.onDark, marginTop: 6, letterSpacing: -0.4 },
  emphDesc: { fontSize: 12, color: colors.onDarkSecondary, marginTop: 5, lineHeight: 19 },
  emphCta: { marginTop: 14, fontSize: 12.5, fontWeight: weight.black, color: colors.goldLight },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '48%' },
  pageCard: { padding: 15, aspectRatio: 1 / 0.9, borderRadius: radius.card },
  pageTag: { fontSize: 9, fontWeight: weight.black, letterSpacing: 0.6, color: colors.gold },
  pageName: { fontSize: 14.5, fontWeight: weight.black, color: colors.ink, marginTop: 2 },
  pageDesc: { fontSize: 10.5, color: colors.textWeak, marginTop: 2, lineHeight: 14 },
  hub2Banner: {
    borderRadius: radius.card,
    padding: 15,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  hub2Title: { fontSize: 14, fontWeight: weight.black, color: colors.onDark },
  hub2Sub: { fontSize: 10.5, color: colors.onDarkSecondary, marginTop: 1 },
});
